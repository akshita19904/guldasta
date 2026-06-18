import mongoose, { Document, Schema } from 'mongoose';

export interface IGift extends Document {
  userId: mongoose.Types.ObjectId;
  personId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priceRange: string;
  category: string;
  isSaved: boolean;
  isAIGenerated: boolean;
  occasion?: string;
  createdAt: Date;
}

const GiftSchema = new Schema<IGift>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  personId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
  title: { type: String, required: true },
  description: { type: String },
  priceRange: { type: String },
  category: { type: String },
  isSaved: { type: Boolean, default: false },
  isAIGenerated: { type: Boolean, default: true },
  occasion: { type: String },
}, { timestamps: true });

export default mongoose.model<IGift>('Gift', GiftSchema);