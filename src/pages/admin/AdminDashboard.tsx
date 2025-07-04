import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  pendingFarmers: number;
  totalProducts: number;
  pendingProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRefunds: number;
  suspendedUsers: number;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    pendingFarmers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingRefunds: 0,
    suspendedUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Mock data for demonstration
      // In real implementation, fetch from Supabase
      setStats({
        totalUsers: 1247,
        totalFarmers: 156,
        totalBuyers: 1091,
        pendingFarmers: 23,
        totalProducts: 892,
        pendingProducts: 45,
        totalOrders: 3421,
        totalRevenue: 125430.50,
        pendingRefunds: 8,
        suspendedUsers: 12,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Welcome back, {user?.name}. Here's what's happening on FarmConnect.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+15%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+22%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Farmer Approvals</p>
                    <p className="text-sm text-gray-600">{stats.pendingFarmers} farmers waiting for approval</p>
                  </div>
                </div>
                <button className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700">
                  Review
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Product Reviews</p>
                    <p className="text-sm text-gray-600">{stats.pendingProducts} products pending approval</p>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                  Review
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Refund Requests</p>
                    <p className="text-sm text-gray-600">{stats.pendingRefunds} refunds awaiting processing</p>
                  </div>
                </div>
                <button className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">
                  Process
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Active Farmers</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.totalFarmers - stats.pendingFarmers}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Active Buyers</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.totalBuyers}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Pending Farmers</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.pendingFarmers}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Suspended Users</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.suspendedUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Review Products</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingCart className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Orders</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="h-6 w-6 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Process Refunds</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-6 w-6 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">View Analytics</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">System Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}