import { Response } from 'express';
import { Groq } from 'groq-sdk';
import Gift from '../models/Gift';
import Person from '../models/Person';
import { AuthRequest } from '../middleware/auth';

const giftDatabase: Record<string, string[]> = {
  cars: ['Car accessory kit', 'Dashboard cam', 'Car perfume set', 'Miniature car model', 'Car cleaning kit'],
  movies: ['OTT subscription', 'Movie night hamper', 'Collectible figurine', 'Cinema gift card'],
  food: ['Premium restaurant voucher', 'Gourmet chocolate box', 'Artisan coffee set', 'Food hamper'],
  travel: ['Travel organizer set', 'Luggage tag set', 'Travel journal', 'Portable charger'],
  books: ['Bestseller book set', 'Kindle subscription', 'Bookstore gift card', 'Book light'],
  music: ['Concert tickets', 'Spotify subscription', 'Vinyl record', 'Wireless earphones'],
  fitness: ['Gym membership', 'Fitness tracker', 'Yoga mat set', 'Protein supplement pack'],
  tech: ['Smart home device', 'Wireless charger', 'Bluetooth speaker', 'USB hub'],
  fashion: ['Luxury wallet', 'Sunglasses', 'Perfume', 'Watch'],
  art: ['Sketch set', 'Canvas painting kit', 'Art journal', 'Online art course'],
  gaming: ['Game controller', 'Gaming headset', 'Game voucher', 'RGB mouse pad'],
  wellness: ['Spa voucher', 'Essential oil set', 'Meditation app subscription', 'Bath bomb set'],
  cooking: ['Premium spice set', 'Cooking class', 'Kitchen gadget set', 'Recipe book'],
  plants: ['Succulent set', 'Indoor plant kit', 'Gardening tools', 'Terrarium kit'],
  photography: ['Camera bag', 'Lens cleaning kit', 'Photo printing voucher', 'Tripod'],
};

const occasionBoosts: Record<string, string[]> = {
  Birthday: ['Personalised gift', 'Experience voucher', 'Surprise hamper', 'Memory book'],
  Anniversary: ['Couple experience', 'Personalised jewellery', 'Photo album', 'Weekend getaway'],
  Graduation: ['Professional bag', 'Planner set', 'Skill course subscription', 'Celebration dinner'],
  Festival: ['Traditional sweets box', 'Home decor item', 'Festive hamper'],
  'Just because': ['Comfort food basket', 'Self-care kit', 'Plant', 'Handwritten letter kit'],
  Custom: ['Personalised gift', 'Experience voucher', 'Premium hamper'],
};

function getRuleBasedGifts(interests: string[], occasion: string, budget: string): string[] {
  const suggestions = new Set<string>();

  interests.forEach(interest => {
    const key = interest.toLowerCase().trim();
    Object.keys(giftDatabase).forEach(dbKey => {
      if (key.includes(dbKey) || dbKey.includes(key)) {
        giftDatabase[dbKey].forEach(g => suggestions.add(g));
      }
    });
  });

  const occasionGifts = occasionBoosts[occasion] || occasionBoosts['Custom'];
  occasionGifts.forEach(g => suggestions.add(g));

  if (suggestions.size < 6) {
    ['Personalised gift', 'Experience voucher', 'Premium hamper', 'Gift card', 'Comfort basket', 'Scented candle set']
      .forEach(g => suggestions.add(g));
  }

  return Array.from(suggestions).slice(0, 8);
}

export const generateGifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personId, occasion, budget, extraContext, manualName, manualInterests } = req.body;

    const occasionText = occasion || 'Birthday';
    const budgetText = budget || '₹500-₹2000';

    let personName = manualName || 'them';
    let relationship = 'friend';
    let interests: string[] = [];
    let notes = '';

    if (personId) {
      const person = await Person.findOne({ _id: personId, userId: req.user._id });
      if (person) {
        personName = person.name;
        relationship = person.relationship;
        interests = person.interests || [];
        notes = person.notes || '';
      }
    } else if (manualInterests) {
      interests = manualInterests.split(',').map((i: string) => i.trim());
    }

    const ruleBasedGifts = getRuleBasedGifts(interests, occasionText, budgetText);

    const prompt = `You are a thoughtful gift advisor for Indian users. Follow these rules strictly.

STRICT RULES:
1. ALL prices MUST be within ${budgetText} — no exceptions whatsoever
2. Occasion is ${occasionText} — every gift must suit this specific occasion
3. User's special request: "${extraContext || 'none'}" — follow this very carefully
4. Interests: ${interests.join(', ') || 'general'} — match gifts to these

Person:
- Name: ${personName}
- Relationship: ${relationship}
- Interests: ${interests.join(', ') || 'not specified'}
- Budget: ${budgetText} (STRICT)
- Occasion: ${occasionText}
- Special request: ${extraContext || 'none'}
${notes ? `- Notes: ${notes}` : ''}

Starting ideas: ${ruleBasedGifts.join(', ')}

Pick 6 most relevant. Personalise each one to ${personName} specifically.
If user gave extra context like "minimal", "lowkey", "eco-friendly" — follow it strictly.

Return ONLY a raw JSON array, no markdown, no backticks, no explanation:
[{
  "title": "specific gift name max 5 words",
  "description": "why this suits ${personName} for ${occasionText} in 2 sentences",
  "priceRange": "realistic Indian rupee price strictly within ${budgetText}",
  "category": "Experience or Tech or Wellness or Books or Food or Fashion or Home or Art or Hobby",
  "whyPerfect": "one line connecting their interests to the occasion"
}]`;

    let gifts;
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });
      const text = completion.choices[0].message.content || '';
      const cleaned = text.replace(/```json|```/g, '').trim();
      gifts = JSON.parse(cleaned);
    } catch (aiError) {
      console.log('AI failed, using fallback:', aiError);
      gifts = ruleBasedGifts.slice(0, 6).map((title, i) => ({
        title,
        description: `A thoughtful ${occasionText.toLowerCase()} gift. Perfect for the occasion and within budget.`,
        priceRange: budgetText,
        category: ['Experience', 'Wellness', 'Food', 'Fashion', 'Tech', 'Art'][i % 6],
        whyPerfect: `Great choice for ${occasionText.toLowerCase()}`
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
    const { personId, title, description, priceRange, category, occasion } = req.body;
    const gift = await Gift.create({
      userId: req.user._id,
      personId: personId || null,
      title, description, priceRange,
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