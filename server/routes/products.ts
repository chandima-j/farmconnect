import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all active products
router.get('/', async (req, res) => {
  try {
    const { category, organic, search, sortBy, limit = '20', offset = '0' } = req.query;

    const where: any = {
      status: 'ACTIVE'
    };

    if (category) {
      where.category = category;
    }

    if (organic === 'true') {
      where.organic = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { category: { contains: search as string } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy === 'price-low') orderBy = { price: 'asc' };
    else if (sortBy === 'price-high') orderBy = { price: 'desc' };
    else if (sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (sortBy === 'name') orderBy = { name: 'asc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        farmer: {
          include: {
            farmer: true
          }
        }
      }
    });

    const formattedProducts = products.map(product => ({
      id: product.id,
      farmerId: product.farmerId,
      farmerName: product.farmer.farmer?.farmName || product.farmer.name,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      unit: product.unit,
      image: product.imageUrl,
      stock: product.stock,
      organic: product.organic,
      harvestDate: product.harvestDate.toISOString().split('T')[0],
      location: product.location,
      rating: product.rating,
      reviews: product.reviewsCount,
      status: product.status.toLowerCase(),
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;