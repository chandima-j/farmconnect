import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all farmers
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await prisma.user.findMany({
      where: {
        userType: 'FARMER',
        status: 'ACTIVE'
      },
      include: {
        farmer: true
      }
    });

    const formattedFarmers = farmers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'farmer',
      avatar: user.avatarUrl,
      createdAt: user.createdAt,
      farmName: user.farmer?.farmName || '',
      location: user.farmer?.location || '',
      description: user.farmer?.description || '',
      rating: user.farmer?.rating || 0,
      totalSales: user.farmer?.totalSales || 0,
      verified: user.farmer?.verified || false,
      status: user.farmer?.status.toLowerCase() || 'pending',
    }));

    res.json(formattedFarmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

export default router;