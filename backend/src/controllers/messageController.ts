import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
const Groq = require('groq-sdk').Groq;

export const generateMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personName, relationship, occasion, tone, extraContext, interests } = req.body;

    if (!occasion || !tone) {
      res.status(400).json({ success: false, message: 'Occasion and tone are required' });
      return;
    }

    const toneGuide: Record<string, string> = {
      warm: 'heartfelt, warm, emotional and sincere',
      funny: 'funny, witty and playful with light humour',
      poetic: 'poetic, lyrical and beautifully written',
      short: 'short, sweet and punchy — max 3 sentences',
      formal: 'professional and formal yet caring',
    };

    const prompt = `Write a ${occasion} message for ${personName || 'someone special'} (${relationship || 'a loved one'}).

Tone: ${toneGuide[tone] || toneGuide.warm}
Interests/personality: ${interests || 'not specified'}
Extra context from sender: ${extraContext || 'none'}

Rules:
- Write in first person (from the sender)
- Make it feel personal and genuine, not generic
- Do NOT use emojis unless tone is funny
- Do NOT use placeholders like [Name]
- Address them as "${personName || 'you'}" directly
- Length: ${tone === 'short' ? '2-3 sentences' : '3-5 sentences'}

Write ONLY the message text. No subject line, no explanation, just the message.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 500,
    });

    const message = completion.choices[0].message.content?.trim() || '';

    res.status(200).json({ success: true, message });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateMultipleMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personName, relationship, occasion, interests, extraContext } = req.body;

    const tones = ['warm', 'funny', 'poetic', 'short'];
    const toneGuide: Record<string, string> = {
      warm: 'heartfelt, warm and emotional',
      funny: 'funny, witty and playful',
      poetic: 'poetic and beautifully written',
      short: 'short and sweet — max 2 sentences',
    };

    const prompt = `Write 4 different ${occasion} messages for ${personName || 'someone special'} (${relationship || 'a loved one'}).
Interests: ${interests || 'not specified'}
Extra: ${extraContext || 'none'}

Write one message for each tone: warm, funny, poetic, short.
Address them as "${personName || 'you'}" directly. First person. No emojis except in funny. No placeholders.

Return ONLY a raw JSON array:
[
  {"tone": "warm", "label": "Heartfelt", "message": "..."},
  {"tone": "funny", "label": "Playful", "message": "..."},
  {"tone": "poetic", "label": "Poetic", "message": "..."},
  {"tone": "short", "label": "Quick & Sweet", "message": "..."}
]`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 1000,
    });

    const text = completion.choices[0].message.content || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const messages = JSON.parse(cleaned);

    res.status(200).json({ success: true, messages });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};