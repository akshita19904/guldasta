import { Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, recipientName, recipientPhone, deliveryAddress, deliveryDate, giftMessage } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart is empty' });
      return;
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId: req.user._id,
      items, totalAmount, recipientName, recipientPhone,
      deliveryAddress, deliveryDate, giftMessage
    });

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};