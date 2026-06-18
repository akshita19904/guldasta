import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const filter: any = { inStock: true };

    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin only — for now anyone logged in can add (you'll restrict this later)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const seedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      res.status(200).json({ success: true, message: 'Products already exist' });
      return;
    }

    const sampleProducts = [
      { name: 'Rose & Lily Bouquet', description: 'Fresh pink roses paired with elegant white lilies, wrapped in premium kraft paper.', price: 899, category: 'Bouquets', tags: ['romantic', 'fresh flowers'], isCustomizable: true },
      { name: 'Sunflower Cheer Bunch', description: 'Bright sunflowers to bring instant joy. Perfect for celebrations.', price: 649, category: 'Bouquets', tags: ['cheerful', 'birthday'], isCustomizable: true },
      { name: 'Mixed Macaron Box', description: 'A box of 12 handcrafted macarons in assorted flavours — pistachio, rose, vanilla, chocolate.', price: 799, category: 'Hampers', tags: ['sweet', 'premium'] },
      { name: 'Self-Care Spa Hamper', description: 'Scented candles, bath salts, body lotion and herbal tea — a relaxing gift set.', price: 1499, category: 'Hampers', tags: ['wellness', 'relaxation'] },
      { name: 'Chocolate Truffle Cake', description: 'Rich Belgian chocolate truffle cake, freshly baked. 1kg, serves 8-10.', price: 1199, category: 'Cakes', tags: ['birthday', 'celebration'] },
      { name: 'Red Velvet Cake', description: 'Classic red velvet with cream cheese frosting. 1kg, serves 8-10.', price: 1099, category: 'Cakes', tags: ['birthday', 'classic'] },
      { name: 'Couple Spa Experience', description: 'A relaxing 90-minute spa session for two at a partner wellness centre.', price: 3499, category: 'Experiences', tags: ['anniversary', 'romantic'] },
      { name: 'Pottery Class for Two', description: 'A fun 2-hour pottery making experience for two people.', price: 2199, category: 'Experiences', tags: ['fun', 'creative'] },
      { name: 'Personalised Photo Frame', description: 'Custom wooden photo frame engraved with their name and a special date.', price: 549, category: 'Personalised', tags: ['sentimental', 'keepsake'], isCustomizable: true },
      { name: 'Custom Name Necklace', description: 'Sterling silver necklace with their name elegantly engraved.', price: 1299, category: 'Personalised', tags: ['jewellery', 'sentimental'], isCustomizable: true },
      { name: 'Succulent Trio Planter', description: 'Three mini succulents in a ceramic planter set. Low maintenance, high charm.', price: 449, category: 'Plants', tags: ['home decor', 'low maintenance'] },
      { name: 'Money Plant in Ceramic Pot', description: 'A lush money plant believed to bring good luck, in a hand-painted pot.', price: 399, category: 'Plants', tags: ['lucky', 'home decor'] },
      { name: 'Flowers + Cake Combo', description: 'A dozen red roses paired with a half kg chocolate cake. The classic celebration combo.', price: 1599, category: 'Combos', tags: ['birthday', 'best seller'] },
      { name: 'Bouquet + Chocolate Box', description: 'Fresh flower bouquet with a box of premium assorted chocolates.', price: 1299, category: 'Combos', tags: ['romantic', 'popular'] },
    ];

    await Product.insertMany(sampleProducts);
    res.status(201).json({ success: true, message: `${sampleProducts.length} products added` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};