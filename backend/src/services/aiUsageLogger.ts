import AiUsageLog from '../models/AiUsageLog';
import mongoose from 'mongoose';

/**
 * Fire-and-forget AI usage logger.
 * Never throws — a logging failure should never break the actual AI feature.
 * Not awaited at call sites on purpose, so it doesn't add latency to the user-facing response.
 */
export function logAiUsage(
  userId: mongoose.Types.ObjectId | string,
  type: 'gift_suggestion' | 'message_single' | 'message_multi',
  success: boolean
): void {
  AiUsageLog.create({ userId, type, success }).catch(err => {
    console.error('[ai-usage-log] Failed to log AI usage:', err);
  });
}