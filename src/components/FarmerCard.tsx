import React from 'react';
import { Star, MapPin, Award, Package } from 'lucide-react';
import { Farmer } from '../types';

interface FarmerCardProps {
  farmer: Farmer;
  onViewProfile?: (farmer: Farmer) => void;
}

export default function FarmerCard({ farmer, onViewProfile }: FarmerCardProps) {
  const handleCardClick = () => {
    if (onViewProfile) {
      onViewProfile(farmer);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-xl">{farmer.farmName}</h3>
              {farmer.verified && (
                <Award className="h-5 w-5 text-primary-600" />
              )}
            </div>
            <p className="text-gray-600 mb-1">by {farmer.name}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
              <MapPin className="h-4 w-4" />
              <span>{farmer.location}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="h-4 w-4 text-secondary-400 fill-current" />
              <span className="font-medium text-gray-900">{farmer.rating}</span>
            </div>
            <p className="text-sm text-gray-500">{farmer.totalSales} sales</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{farmer.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Package className="h-4 w-4" />
            <span>Fresh produce daily</span>
          </div>
          
          <button
            onClick={handleCardClick}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors group-hover:bg-primary-700"
          >
            View Products
          </button>
        </div>
      </div>
    </div>
  );
}