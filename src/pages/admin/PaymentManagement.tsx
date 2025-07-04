import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  DollarSign, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Download,
  CreditCard
} from 'lucide-react';
import { Order, PaymentTransaction } from '../../types';

interface PaymentWithDetails extends PaymentTransaction {
  buyerName: string;
  farmerName: string;
  orderItems: string;
}

export default function PaymentManagement() {
  const { user, isAdmin } = useAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, filterStatus]);

  const loadPayments = async () => {
    try {
      // Mock data for demonstration
      const mockPayments: PaymentWithDetails[] = [
        {
          id: '1',
          orderId: 'ORD-001',
          amount: 45.99,
          status: 'completed',
          paymentMethod: 'Credit Card',
          transactionId: 'TXN-12345',
          createdAt: '2024-01-20T10:30:00Z',
          buyerName: 'Jane Smith',
          farmerName: 'Green Valley Farm',
          orderItems: 'Organic Tomatoes, Fresh Spinach',
        },
        {
          id: '2',
          orderId: 'ORD-002',
          amount: 78.50,
          status: 'pending',
          paymentMethod: 'PayPal',
          createdAt: '2024-01-21T14:15:00Z',
          buyerName: 'Mike Johnson',
          farmerName: 'Sunrise Citrus Farms',
          orderItems: 'Navel Oranges, Meyer Lemons',
        },
        {
          id: '3',
          orderId: 'ORD-003',
          amount: 32.25,
          status: 'failed',
          paymentMethod: 'Credit Card',
          createdAt: '2024-01-19T09:20:00Z',
          buyerName: 'Sarah Wilson',
          farmerName: 'Green Valley Farm',
          orderItems: 'Rainbow Carrots',
        },
        {
          id: '4',
          orderId: 'ORD-004',
          amount: 89.99,
          status: 'refunded',
          paymentMethod: 'Credit Card',
          transactionId: 'TXN-67890',
          createdAt: '2024-01-18T16:45:00Z',
          refundedAt: '2024-01-20T11:30:00Z',
          refundReason: 'Product quality issue',
          buyerName: 'Bob Davis',
          farmerName: 'Organic Harvest Co',
          orderItems: 'Mixed Vegetables Box',
        },
      ];

      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    setFilteredPayments(filtered);
  };

  const handleRefund = async (paymentId: string, reason: string) => {
    try {
      // In real implementation, process refund through payment gateway
      console.log(`Processing refund for payment ${paymentId}: ${reason}`);
      
      // Update local state for demo
      setPayments(prev => prev.map(payment => {
        if (payment.id === paymentId) {
          return {
            ...payment,
            status: 'refunded' as const,
            refundedAt: new Date().toISOString(),
            refundReason: reason,
          };
        }
        return payment;
      }));

      setShowRefundModal(false);
      setRefundReason('');
      
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const handleRetryPayment = async (paymentId: string) => {
    try {
      // In real implementation, retry payment processing
      console.log(`Retrying payment ${paymentId}`);
      
      // Update local state for demo
      setPayments(prev => prev.map(payment => {
        if (payment.id === paymentId) {
          return { ...payment, status: 'pending' as const };
        }
        return payment;
      }));
      
    } catch (error) {
      console.error('Error retrying payment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      case 'refunded':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Refunded</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
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
            <DollarSign className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          </div>
          <p className="text-gray-600">Monitor transactions, process refunds, and manage payment issues.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'refunded').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Export Button */}
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Payments ({filteredPayments.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.orderId}</div>
                      {payment.transactionId && (
                        <div className="text-sm text-gray-500">{payment.transactionId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.buyerName}</div>
                      <div className="text-sm text-gray-500">{payment.farmerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {payment.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowRefundModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Process Refund"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}

                        {payment.status === 'failed' && (
                          <button
                            onClick={() => handleRetryPayment(payment.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Retry Payment"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Payment Detail Modal */}
        {showPaymentModal && selectedPayment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.orderId}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">${selectedPayment.amount.toFixed(2)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.paymentMethod}</p>
                  </div>

                  {selectedPayment.transactionId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayment.transactionId}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.buyerName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Farmer</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.farmerName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Items</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.orderItems}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedPayment.refundedAt && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Refunded At</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedPayment.refundedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Refund Reason</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPayment.refundReason}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedPayment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Process Refund</h3>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.orderId}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Refund Amount</label>
                    <p className="mt-1 text-sm text-gray-900">${selectedPayment.amount.toFixed(2)}</p>
                  </div>

                  <div>
                    <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700">
                      Refund Reason *
                    </label>
                    <textarea
                      id="refundReason"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter reason for refund..."
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRefund(selectedPayment.id, refundReason)}
                    disabled={!refundReason.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Process Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}