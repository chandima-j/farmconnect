import React from 'react';
import { Star, MapPin, Calendar, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.organic && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
              Organic
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white rounded-full px-2 py-1">
          <Star className="h-3 w-3 text-secondary-400 fill-current" />
          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{product.name}</h3>
          <div className="text-right">
            <p className="text-xl font-bold text-primary-600">
              ${product.price}
              <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
            </p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{product.farmerName}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Harvested {new Date(product.harvestDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            <span className={`h-2 w-2 rounded-full ${product.stock > 10 ? 'bg-green-400' : product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}