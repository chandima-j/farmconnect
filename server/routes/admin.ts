import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get admin stats (placeholder)
router.get('/stats', async (req, res) => {
  try {
    res.json({
      totalUsers: 0,
      totalFarmers: 0,
      totalBuyers: 0,
      pendingFarmers: 0,
      totalProducts: 0,
      pendingProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingRefunds: 0,
      suspendedUsers: 0
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;