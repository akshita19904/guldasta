import { Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
import AiUsageLog from '../models/AiUsageLog';
import { AuthRequest } from '../middleware/auth';

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalOrders,
      revenueResult,
      statusBreakdown,
      bestSellers,
      categoryBreakdown,
      aiUsageBreakdown,
      ordersOverTime,
    ] = await Promise.all([
      User.countDocuments(),

      Order.countDocuments(),

      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', unitsSold: { $sum: '$items.quantity' } } },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
      ]),

      Order.aggregate([
        { $unwind: '$items' },
        {
          $addFields: {
            productObjectId: {
              $convert: { input: '$items.productId', to: 'objectId', onError: null, onNull: null },
            },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productObjectId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$product.category', unitsSold: { $sum: '$items.quantity' } } },
        { $sort: { unitsSold: -1 } },
      ]),

      AiUsageLog.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            successful: { $sum: { $cond: ['$success', 1, 0] } },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          },
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalAiCalls = aiUsageBreakdown.reduce((sum: number, r: any) => sum + r.total, 0);
    const totalAiSuccessful = aiUsageBreakdown.reduce((sum: number, r: any) => sum + r.successful, 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalOrders,
        totalRevenue,
        statusBreakdown: statusBreakdown.map((s: any) => ({ status: s._id, count: s.count })),
        bestSellers: bestSellers.map((b: any) => ({ name: b._id, unitsSold: b.unitsSold })),
        categoryBreakdown: categoryBreakdown.map((c: any) => ({ category: c._id, unitsSold: c.unitsSold })),
        aiUsage: {
          totalCalls: totalAiCalls,
          successRate: totalAiCalls > 0 ? Math.round((totalAiSuccessful / totalAiCalls) * 100) : 0,
          byType: aiUsageBreakdown.map((a: any) => ({
            type: a._id,
            total: a.total,
            successful: a.successful,
          })),
        },
        ordersOverTime: ordersOverTime.map((o: any) => ({
          label: `${monthNames[o._id.month - 1]} ${o._id.year}`,
          count: o.count,
          revenue: o.revenue,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};