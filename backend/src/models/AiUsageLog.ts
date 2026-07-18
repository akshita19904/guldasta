import mongoose, { Document, Schema } from 'mongoose';

export interface IAiUsageLog extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'gift_suggestion' | 'message_single' | 'message_multi';
  success: boolean;
  createdAt: Date;
}

const AiUsageLogSchema = new Schema<IAiUsageLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['gift_suggestion', 'message_single', 'message_multi'],
    required: true,
  },
  success: { type: Boolean, required: true },
}, { timestamps: true });

export default mongoose.model<IAiUsageLog>('AiUsageLog', AiUsageLogSchema);