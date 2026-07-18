import express from 'express';
import { getNotesForPerson, addNote, deleteNote } from '../controllers/noteController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.get('/:personId', getNotesForPerson);
router.post('/', addNote);
router.delete('/:id', deleteNote);

export default router;