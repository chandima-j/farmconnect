import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getPassword(envVar: string, label: string) {
  if (process.env[envVar]) return process.env[envVar] as string;
  throw new Error(`❌ ERROR: No ${label} password set in .env. Set ${envVar} in your .env for seeding!`);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Require environment variables for passwords
  const adminPassword = await bcrypt.hash(getPassword('ADMIN_PASSWORD', 'admin'), 12);
  const farmerPassword = await bcrypt.hash(getPassword('FARMER_PASSWORD', 'farmer'), 12);
  const buyerPassword = await bcrypt.hash(getPassword('BUYER_PASSWORD', 'buyer'), 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farmconnect.com' },
    update: {},
    create: {
      email: 'admin@farmconnect.com',
      password: adminPassword,
      name: 'Super Admin',
      userType: 'ADMIN',
      status: 'ACTIVE',
      admin: {
        create: {
          role: 'SUPER_ADMIN',
          permissions: '["all"]'
        }
      }
    }
  });

  // Create test farmer
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@test.com' },
    update: {},
    create: {
      email: 'farmer@test.com',
      password: farmerPassword,
      name: 'John Martinez',
      userType: 'FARMER',
      status: 'ACTIVE',
      farmer: {
        create: {
          farmName: 'Green Valley Organic Farm',
          location: 'Sonoma County, CA',
          description: 'Certified organic farm specializing in seasonal vegetables and herbs.',
          rating: 4.9,
          totalSales: 1250,
          verified: true,
          status: 'ACTIVE'
        }
      }
    }
  });

  // Create test buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      email: 'buyer@test.com',
      password: buyerPassword,
      name: 'Jane Smith',
      userType: 'BUYER',
      status: 'ACTIVE',
      buyer: {
        create: {
          address: '123 Main St, San Francisco, CA',
          phone: '+1-555-0123',
          status: 'ACTIVE'
        }
      }
    }
  });

  // Create sample products
  const products = [
    {
      name: 'Organic Roma Tomatoes',
      description: 'Vine-ripened organic Roma tomatoes, perfect for sauces and cooking.',
      category: 'Vegetables',
      price: 4.99,
      unit: 'lb',
      imageUrl: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      stock: 50,
      organic: true,
      harvestDate: new Date('2024-01-15'),
      location: 'Sonoma County, CA',
      rating: 4.8,
      reviewsCount: 24,
      status: 'ACTIVE'
    },
    {
      name: 'Fresh Spinach Leaves',
      description: 'Tender baby spinach leaves, harvest fresh daily.',
      category: 'Leafy Greens',
      price: 3.49,
      unit: 'bunch',
      imageUrl: 'https://images.pexels.com/photos/2325967/pexels-photo-2325967.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      stock: 30,
      organic: true,
      harvestDate: new Date('2024-01-20'),
      location: 'Sonoma County, CA',
      rating: 4.9,
      reviewsCount: 18,
      status: 'ACTIVE'
    }
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { 
        id: `${farmer.id}-${productData.name.replace(/\s+/g, '-').toLowerCase()}`
      },
      update: {},
      create: {
        ...productData,
        farmerId: farmer.id
      }
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('🔑 Test accounts created with passwords from .env:');
  console.log('   Admin: admin@farmconnect.com');
  console.log('   Farmer: farmer@test.com');
  console.log('   Buyer: buyer@test.com');
  console.log('📝 Check your .env file for the actual passwords used.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });