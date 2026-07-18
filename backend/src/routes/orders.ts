import express from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus, getAllOrders } from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = express.Router();
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/admin/all', requireAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', requireAdmin, updateOrderStatus);

export default router;