import express from 'express';
import { getPeople, addPerson, updatePerson, deletePerson, getDashboardStats } from '../controllers/personController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getPeople);
router.post('/', addPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);
router.get('/stats', getDashboardStats);

export default router;