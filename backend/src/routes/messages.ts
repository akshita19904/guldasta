import express from 'express';
import { generateMessage, generateMultipleMessages } from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.post('/generate', generateMessage);
router.post('/generate-all', generateMultipleMessages);

export default router;