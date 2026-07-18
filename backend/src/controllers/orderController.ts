import { Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import nodemailer from 'nodemailer';

const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP || '919999999999';

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

    // Notify admin via email (non-blocking — don't fail order if email fails)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const itemsList = items.map((i: any) => `${i.name} x${i.quantity} (₹${i.price * i.quantity})`).join('<br>');

      await transporter.sendMail({
        from: `"Guldasta Orders" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New order — ${recipientName} — ₹${totalAmount}`,
        html: `
          <h2>New Guldasta order</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Recipient:</strong> ${recipientName}</p>
          <p><strong>Phone:</strong> ${recipientPhone}</p>
          <p><strong>Address:</strong> ${deliveryAddress}</p>
          <p><strong>Delivery date:</strong> ${new Date(deliveryDate).toLocaleDateString()}</p>
          <p><strong>Items:</strong><br>${itemsList}</p>
          <p><strong>Total:</strong> ₹${totalAmount}</p>
          ${giftMessage ? `<p><strong>Gift message:</strong> "${giftMessage}"</p>` : ''}
        `
      });
    } catch (emailError) {
      console.log('Order email notification failed:', emailError);
    }

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

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, order });
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

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};