import { Response } from 'express';
import Gift from '../models/Gift';
import Person from '../models/Person';
import Product from '../models/Product';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import Note from '../models/Note';
import { logAiUsage } from '../services/aiUsageLogger';
import { rankProducts, PersonContext, PastGift, ProductForScoring } from '../services/scoringEngine';
const Groq = require('groq-sdk').Groq;

const budgetRanges: Record<string, { min: number; max: number }> = {
  'Under ₹500': { min: 0, max: 500 },
  '₹500-₹2000': { min: 500, max: 2000 },
  '₹2000-₹5000': { min: 2000, max: 5000 },
  '₹5000-₹10000': { min: 5000, max: 10000 },
  '₹10000+': { min: 10000, max: 999999 },
};

export const generateGifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personId, occasion, budget, extraContext, manualName, manualInterests } = req.body;

    const occasionText = occasion || 'Birthday';
    const budgetText = budget || '₹500-₹2000';
    const range = budgetRanges[budgetText] || budgetRanges['₹500-₹2000'];

    // ── Step 1: Resolve person context ──────────────────────────────────
    let personName = manualName || 'them';
    let relationship = 'Friend';
    let interests: string[] = [];
    let notes = '';
    let age: number | undefined;
    let gender: string | undefined;
    let pastGiftsRaw: PastGift[] = [];

    if (personId) {
      const person = await Person.findOne({ _id: personId, userId: req.user._id });
      if (person) {
        personName = person.name;
        relationship = person.relationship;
        interests = person.interests || [];
        notes = person.notes || '';
        age = person.age;
        gender = person.gender;
      }

      const savedGifts = await Gift.find({ userId: req.user._id, personId })
        .sort({ createdAt: -1 }).limit(15);
      pastGiftsRaw = savedGifts.map(g => ({
        productId: undefined,
        title: g.title,
        category: g.category || '',
        occasion: g.occasion,
        createdAt: g.createdAt,
      }));

      const recentNotes = await Note.find({ userId: req.user._id, personId })
        .sort({ createdAt: -1 }).limit(5);
      if (recentNotes.length > 0) {
        notes = notes + ' ' + recentNotes.map((n: any) => n.content).join('. ');
      }
    } else if (manualInterests) {
      interests = manualInterests.split(',').map((i: string) => i.trim());
    }

    // ── Step 2: Build platform-wide popularity map ───────────────────────
    const popularityAgg = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', unitsSold: { $sum: '$items.quantity' } } },
      { $sort: { unitsSold: -1 } },
    ]);

    const maxSold = popularityAgg[0]?.unitsSold || 1;
    const popularityMap: Record<string, number> = {};
    for (const entry of popularityAgg) {
      popularityMap[entry._id] = Math.round((entry.unitsSold / maxSold) * 100);
    }

    // ── Step 3: Fetch all in-stock products, score and rank ───────────────
    const allProducts = await Product.find({ inStock: true });

    if (allProducts.length === 0) {
      res.status(200).json({
        success: true, gifts: [],
        person: { name: personName, relationship },
        message: 'No products available right now. Check back soon!'
      });
      return;
    }

    const personContext: PersonContext = { relationship, interests, notes, age, gender };

    const productsForScoring: ProductForScoring[] = allProducts.map(p => ({
      _id: String(p._id),
      name: p.name,
      price: p.price,
      category: p.category,
      tags: p.tags,
      isCustomizable: p.isCustomizable,
      inStock: p.inStock,
    }));

    const ranked = rankProducts(
      productsForScoring,
      personContext,
      occasionText,
      range.min,
      range.max,
      pastGiftsRaw,
      popularityMap
    );

    // Top 10 pre-ranked products go to AI for personalization
    const top10 = ranked.slice(0, 10);
    const pastGiftNames = pastGiftsRaw.map(g => g.title);

    // ── Step 4: AI personalizes the pre-ranked list ───────────────────────
    const productList = top10.map(p =>
      `ID:${p._id}|${p.name}|₹${p.price}|${p.category}|tags:${p.tags.join(',')}|customizable:${p.isCustomizable}|score:${p.scoreBreakdown.total}`
    ).join('\n');

    const personDesc = [
      `${personName} (${relationship})`,
      age ? `Age: ${age}` : '',
      gender ? `Gender: ${gender}` : '',
      interests.length > 0 ? `Interests: ${interests.join(', ')}` : '',
    ].filter(Boolean).join(' · ');

    const prompt = `You are a gift advisor. The following products have already been scored and ranked for ${personDesc}. Pick the best 6 and write a personal reason why each suits them specifically.

Person profile:
- Name: ${personName}
- Relationship: ${relationship}
${age ? `- Age: ${age}` : ''}
${gender ? `- Gender: ${gender}` : ''}
- Interests: ${interests.join(', ') || 'not specified'}
- Occasion: ${occasionText}
- Budget: ${budgetText}
- Special request: ${extraContext || 'none'}
${notes ? `- Notes/memories: ${notes}` : ''}
${pastGiftNames.length > 0 ? `\nDO NOT suggest these gifts again (already given): ${pastGiftNames.join(', ')}` : ''}

STRICT RULES:
- Do NOT suggest gifts clearly meant for the opposite gender or wrong age group
- Do NOT suggest couple/romantic products unless relationship is Partner
- Only pick from the list below using exact IDs

PRE-RANKED PRODUCTS (higher score = better match):
${productList}

Return ONLY a raw JSON array, no markdown:
[{
  "productId": "exact ID from the list",
  "name": "exact product name",
  "price": number,
  "category": "exact category",
  "isCustomizable": boolean,
  "whyPerfect": "1-2 sentences personal to ${personName} referencing their age, gender, or interests"
}]`;

    let gifts;
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 1500,
      });
      const text = completion.choices[0].message.content || '';
      const cleaned = text.replace(/```json|```/g, '').trim();
      let parsed = JSON.parse(cleaned);

      const seen = new Set();
      gifts = parsed.filter((g: any) => {
        if (seen.has(g.productId)) return false;
        seen.add(g.productId);
        return true;
      });

      if (gifts.length < 4) {
        const usedIds = new Set(gifts.map((g: any) => g.productId));
        const fillers = top10
          .filter(p => !usedIds.has(p._id))
          .slice(0, 6 - gifts.length)
          .map(p => ({
            productId: p._id,
            name: p.name,
            price: p.price,
            category: p.category,
            isCustomizable: p.isCustomizable,
            whyPerfect: `A top-matched ${occasionText.toLowerCase()} gift for ${personName} based on their profile.`
          }));
        gifts = [...gifts, ...fillers];
      }

      logAiUsage(req.user._id, 'gift_suggestion', true);
    } catch (aiError) {
      console.log('AI failed, using scored fallback:', aiError);
      logAiUsage(req.user._id, 'gift_suggestion', false);
      gifts = top10.slice(0, 6).map(p => ({
        productId: p._id,
        name: p.name,
        price: p.price,
        category: p.category,
        isCustomizable: p.isCustomizable,
        whyPerfect: `A top-ranked ${occasionText.toLowerCase()} gift for ${personName} based on their profile.`
      }));
    }

    res.status(200).json({
      success: true,
      gifts,
      person: { name: personName, relationship }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate gifts' });
  }
};

export const saveGift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personId, productId, name, price, category, occasion } = req.body;
    const gift = await Gift.create({
      userId: req.user._id,
      personId: personId || null,
      title: name,
      description: '',
      priceRange: `₹${price}`,
      category, occasion, isSaved: true, isAIGenerated: true
    });
    res.status(201).json({ success: true, gift });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedGifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gifts = await Gift.find({ userId: req.user._id, isSaved: true })
      .populate('personId', 'name relationship')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, gifts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Gift.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGiftHistoryForPerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personId } = req.params;
    const gifts = await Gift.find({ userId: req.user._id, personId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, history: gifts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};