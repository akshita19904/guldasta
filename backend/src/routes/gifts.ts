import express from 'express';
import { generateGifts, saveGift, getSavedGifts, deleteGift } from '../controllers/giftController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.post('/generate', generateGifts);
router.post('/save', saveGift);
router.get('/saved', getSavedGifts);
router.delete('/:id', deleteGift);

export default router;