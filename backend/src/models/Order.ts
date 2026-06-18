import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  customMessage?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDate: Date;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  giftMessage?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    customMessage: String,
  }],
  totalAmount: { type: Number, required: true },
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  giftMessage: { type: String },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);