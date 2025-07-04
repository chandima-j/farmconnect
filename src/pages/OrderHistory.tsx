import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('farmconnect_token');
    if (token) {
      apiClient.setToken(token);
    }
    apiClient.getOrders()
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        if (err.message && err.message.toLowerCase().includes('unauthorized')) {
          setError('You must be logged in to view your orders.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load orders.');
        }
        setOrders([]);
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {orders.length === 0 && !error ? (
          <p>No orders found.</p>
        ) : (
          <ul>
            {orders.map(order => (
              <li key={order.id} className="mb-4 p-4 bg-white rounded shadow">
                <div><b>Order ID:</b> {order.id}</div>
                <div><b>Status:</b> {order.status}</div>
                <div><b>Total:</b> ${order.total}</div>
                <div><b>Created:</b> {new Date(order.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 