import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Truck, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh from{' '}
                <span className="text-primary-600">Farm</span>{' '}
                to Your{' '}
                <span className="text-secondary-600">City</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect directly with local farmers to buy the freshest, highest-quality produce. 
                Supporting sustainable agriculture while bringing farm-fresh goodness to your table.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors group"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/farmers"
                className="inline-flex items-center justify-center px-8 py-3 border border-primary-600 text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50 transition-colors"
              >
                Meet Our Farmers
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">100% Fresh</h3>
                  <p className="text-sm text-gray-500">Harvested daily</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Fast Delivery</h3>
                  <p className="text-sm text-gray-500">Same day shipping</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Guaranteed Quality</h3>
                  <p className="text-sm text-gray-500">Money back promise</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fresh vegetables and fruits"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          </div>
        </div>
      </div>
    </div>
  );
}