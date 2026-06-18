import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  tags: string[];
  inStock: boolean;
  isCustomizable: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Bouquets', 'Hampers', 'Experiences', 'Cakes', 'Personalised', 'Plants', 'Combos']
  },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
  inStock: { type: Boolean, default: true },
  isCustomizable: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);