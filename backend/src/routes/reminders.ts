import express from 'express';
import { getReminders, addReminder, updateReminder, deleteReminder, syncPeopleReminders, syncIndianHolidays } from '../controllers/reminderController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.get('/', getReminders);
router.post('/', addReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.post('/sync', syncPeopleReminders);
router.post('/sync-holidays', syncIndianHolidays);

export default router;