import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logAiUsage } from '../services/aiUsageLogger';
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

    const prompt = `Write a deeply personal ${occasion} message for ${personName || 'someone special'}, your ${relationship || 'loved one'}.

Tone: ${toneGuide[tone] || toneGuide.warm}
Their personality/vibe: ${interests || 'not specified'}
Important context from sender: ${extraContext || 'none'}

Rules:
- Write in first person (from the sender)
- This must feel handcrafted for ${personName || 'them'} specifically — reference their personality or the given context naturally
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

    logAiUsage(req.user._id, 'message_single', true);
    res.status(200).json({ success: true, message });

  } catch (error: any) {
    logAiUsage(req.user._id, 'message_single', false);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateMultipleMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personName, relationship, occasion, interests, extraContext } = req.body;

    const prompt = `Write 4 deeply personal ${occasion} messages for ${personName || 'someone special'}, your ${relationship || 'loved one'}.
${interests ? `Their personality/vibe: ${interests}` : ''}
${extraContext ? `Important context from the sender: ${extraContext}` : ''}

Rules:
- Address them directly by name as "${personName || 'you'}" — never say "you" generically
- Each message must feel handcrafted specifically FOR this person, not a generic template
- Reference their personality or the given context naturally, don't force it
- Write in first person from the sender's perspective
- No placeholders like [Name] or [occasion]
- Warm tone: emotional and sincere. Funny tone: genuinely witty, not cheesy. Poetic tone: lyrical, use metaphor. Short tone: punchy, max 2 sentences

Return ONLY a raw JSON array, no markdown:
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

    logAiUsage(req.user._id, 'message_multi', true);
    res.status(200).json({ success: true, messages });

  } catch (error: any) {
    logAiUsage(req.user._id, 'message_multi', false);
    res.status(500).json({ success: false, message: error.message });
  }
};