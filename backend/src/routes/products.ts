import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, seedProducts } from '../controllers/productController';

const router = express.Router();

router.get('/', getProducts);
router.get('/seed', seedProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;