import express from 'express';
import { createOrder, getMyOrders, cancelOrder } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.put('/:id/cancel', cancelOrder);

export default router;