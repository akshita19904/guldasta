import express from 'express';
import { generateGifts, saveGift, getSavedGifts, deleteGift, getGiftHistoryForPerson } from '../controllers/giftController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.post('/generate', generateGifts);
router.post('/save', saveGift);
router.get('/saved', getSavedGifts);
router.get('/history/:personId', getGiftHistoryForPerson);
router.delete('/:id', deleteGift);

export default router;