export interface User {
  id: string;
  email: string;
  name: string;
  type: 'farmer' | 'buyer' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Farmer extends User {
  type: 'farmer';
  farmName: string;
  location: string;
  description: string;
  rating: number;
  totalSales: number;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
}

export interface Buyer extends User {
  type: 'buyer';
  address: string;
  phone: string;
  status: 'active' | 'suspended';
}

export interface Admin extends User {
  type: 'admin';
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
}

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  stock: number;
  organic: boolean;
  harvestDate: string;
  location: string;
  rating: number;
  reviews: number;
  status: 'active' | 'pending' | 'rejected' | 'suspended';
  approvedBy?: string;
  approvedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  farmerId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: string;
  deliveryDate?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  refundReason?: string;
  refundedBy?: string;
  refundedAt?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'product' | 'order' | 'payment';
  targetId: string;
  details: string;
  timestamp: string;
}