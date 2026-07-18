import express from 'express';
import { getAnalytics } from '../controllers/adminAnalyticsController';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = express.Router();
router.use(protect);
router.use(requireAdmin);

router.get('/analytics', getAnalytics);

export default router;