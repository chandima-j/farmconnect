import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Ban,
  UserCheck,
  Mail
} from 'lucide-react';
import { User, Farmer, Buyer } from '../../types';

interface UserWithDetails extends User {
  status: 'active' | 'suspended' | 'pending';
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
  farmName?: string;
  location?: string;
  verified?: boolean;
}

export default function UserManagement() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'farmer' | 'buyer' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterType, filterStatus]);

  const loadUsers = async () => {
    try {
      // Mock data for demonstration
      const mockUsers: UserWithDetails[] = [
        {
          id: '1',
          email: 'john.farmer@example.com',
          name: 'John Martinez',
          type: 'farmer',
          status: 'active',
          createdAt: '2024-01-15T00:00:00Z',
          lastLogin: '2024-01-20T10:30:00Z',
          farmName: 'Green Valley Farm',
          location: 'California',
          verified: true,
          totalOrders: 45,
        },
        {
          id: '2',
          email: 'jane.buyer@example.com',
          name: 'Jane Smith',
          type: 'buyer',
          status: 'active',
          createdAt: '2024-01-10T00:00:00Z',
          lastLogin: '2024-01-21T14:15:00Z',
          totalOrders: 12,
          totalSpent: 245.50,
        },
        {
          id: '3',
          email: 'pending.farmer@example.com',
          name: 'Mike Johnson',
          type: 'farmer',
          status: 'pending',
          createdAt: '2024-01-18T00:00:00Z',
          farmName: 'Sunrise Organic Farm',
          location: 'Oregon',
          verified: false,
        },
        {
          id: '4',
          email: 'suspended.user@example.com',
          name: 'Bob Wilson',
          type: 'buyer',
          status: 'suspended',
          createdAt: '2024-01-05T00:00:00Z',
          lastLogin: '2024-01-15T09:20:00Z',
          totalOrders: 3,
          totalSpent: 89.25,
        },
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.farmName && user.farmName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId: string, action: 'approve' | 'suspend' | 'activate' | 'delete') => {
    try {
      // In real implementation, make API call to Supabase
      console.log(`Performing ${action} on user ${userId}`);
      
      // Update local state for demo
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'approve':
              return { ...user, status: 'active' as const, verified: true };
            case 'suspend':
              return { ...user, status: 'suspended' as const };
            case 'activate':
              return { ...user, status: 'active' as const };
            case 'delete':
              return user; // In real app, remove from list
            default:
              return user;
          }
        }
        return user;
      }));

      // Log admin action
      // await logAdminAction(action, 'user', userId);
      
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended</span>;
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
            <Users className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">Manage farmers, buyers, and their account status.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All User Types</option>
              <option value="farmer">Farmers</option>
              <option value="buyer">Buyers</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.type === 'farmer' ? 'bg-green-100 text-green-800' :
                        user.type === 'buyer' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.type === 'farmer' ? (
                        <div>
                          <div>{user.farmName}</div>
                          <div className="text-xs">{user.location}</div>
                        </div>
                      ) : (
                        <div>
                          <div>{user.totalOrders || 0} orders</div>
                          {user.totalSpent && (
                            <div className="text-xs">${user.totalSpent.toFixed(2)} spent</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {user.status === 'pending' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {user.status === 'active' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-red-600 hover:text-red-900"
                            title="Suspend"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}

                        {user.status === 'suspended' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.type}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>

                  {selectedUser.type === 'farmer' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Farm Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.farmName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.location}</p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedUser.lastLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedUser.lastLogin).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Send Email
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