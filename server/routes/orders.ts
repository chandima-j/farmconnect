import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all orders for the logged-in user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  console.log('Incoming headers:', req.headers); // DEBUG LOG
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;
    let orders = [];
    if (userType === 'BUYER') {
      orders = await prisma.order.findMany({ where: { buyerId: userId } });
    } else if (userType === 'FARMER') {
      orders = await prisma.order.findMany({ where: { farmerId: userId } });
    } else {
      // For admin or other types, return all orders (or restrict as needed)
      orders = await prisma.order.findMany();
    }
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { items, total, buyerId, farmerId } = req.body;
    // WARNING: Never store raw card data in production! Use a payment processor instead.
    const order = await prisma.order.create({
      data: {
        items: JSON.stringify(items),
        total: total,
        buyerId: buyerId || 'buyer_placeholder',
        farmerId: farmerId || 'farmer_placeholder',
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;