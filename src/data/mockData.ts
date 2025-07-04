import { Product, Farmer } from '../types';
import { apiClient } from '../lib/api';

// Keep mock data for fallback, but prefer API data
export const mockFarmers: Farmer[] = [
  {
    id: '1',
    email: 'john@greenvalley.com',
    name: 'John Martinez',
    type: 'farmer',
    farmName: 'Green Valley Organic Farm',
    location: 'Sonoma County, CA',
    description: 'Certified organic farm specializing in seasonal vegetables and herbs. Family-owned for three generations.',
    rating: 4.9,
    totalSales: 1250,
    verified: true,
    createdAt: '2023-01-15T00:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    email: 'maria@sunrisefarms.com',
    name: 'Maria Rodriguez',
    type: 'farmer',
    farmName: 'Sunrise Citrus Farms',
    location: 'Central Valley, CA',
    description: 'Premium citrus fruits grown with sustainable farming practices. Specializing in oranges, lemons, and grapefruits.',
    rating: 4.7,
    totalSales: 890,
    verified: true,
    createdAt: '2023-02-20T00:00:00Z',
    status: 'active',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    farmerId: '1',
    farmerName: 'Green Valley Organic Farm',
    name: 'Organic Roma Tomatoes',
    description: 'Vine-ripened organic Roma tomatoes, perfect for sauces and cooking. Grown without pesticides.',
    category: 'Vegetables',
    price: 4.99,
    unit: 'lb',
    image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    stock: 50,
    organic: true,
    harvestDate: '2024-01-15',
    location: 'Sonoma County, CA',
    rating: 4.8,
    reviews: 24,
    status: 'active',
  },
  {
    id: '2',
    farmerId: '1',
    farmerName: 'Green Valley Organic Farm',
    name: 'Fresh Spinach Leaves',
    description: 'Tender baby spinach leaves, harvest fresh daily. Rich in iron and vitamins.',
    category: 'Leafy Greens',
    price: 3.49,
    unit: 'bunch',
    image: 'https://images.pexels.com/photos/2325967/pexels-photo-2325967.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    stock: 30,
    organic: true,
    harvestDate: '2024-01-20',
    location: 'Sonoma County, CA',
    rating: 4.9,
    reviews: 18,
    status: 'active',
  },
];

// API data fetchers
export const fetchFarmers = async (): Promise<Farmer[]> => {
  try {
    return await apiClient.getFarmers();
  } catch (error) {
    console.error('Error fetching farmers from API, using mock data:', error);
    return mockFarmers;
  }
};

export const fetchProducts = async (params?: any): Promise<Product[]> => {
  try {
    return await apiClient.getProducts(params);
  } catch (error) {
    console.error('Error fetching products from API, using mock data:', error);
    return mockProducts;
  }
};