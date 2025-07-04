import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import FarmerCard from '../components/FarmerCard';
import { fetchProducts, fetchFarmers } from '../data/mockData';
import { ArrowRight, Star, Users, Package, TrendingUp } from 'lucide-react';
import { Product, Farmer } from '../types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredFarmers, setFeaturedFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [products, farmers] = await Promise.all([
        fetchProducts({ limit: 4 }),
        fetchFarmers()
      ]);
      
      setFeaturedProducts(products.slice(0, 4));
      setFeaturedFarmers(farmers.slice(0, 2));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-gray-600">Local Farmers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg mx-auto mb-4">
                <Package className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-gray-600">Products Sold</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-2">Fresh picks from our top-rated farmers</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(product) => console.log('View product:', product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Meet Our Farmers</h2>
              <p className="text-gray-600 mt-2">Supporting sustainable agriculture in your community</p>
            </div>
            <Link
              to="/farmers"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Farmers
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredFarmers.map((farmer) => (
              <FarmerCard
                key={farmer.id}
                farmer={farmer}
                onViewProfile={(farmer) => console.log('View farmer:', farmer)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FarmConnect for their fresh produce needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Sign Up as Buyer
            </Link>
            <Link
              to="/register?type=farmer"
              className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-primary-500 transition-colors"
            >
              Join as Farmer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}