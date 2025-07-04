import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout() {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [loading, setLoading] = useState(false);
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buyerId = user?.id;
  const farmerId = items[0]?.product.farmerId;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total: totalPrice,
          buyerId,
          farmerId,
        }),
      });
      if (!response.ok) throw new Error('Order failed');
    clearCart();
    navigate('/order-success');
    } catch (err: any) {
      alert('Order failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required className="mb-2 w-full p-2 border rounded" />
        <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required className="mb-2 w-full p-2 border rounded" />
        <input name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleInputChange} required className="mb-2 w-full p-2 border rounded" />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required className="mb-2 w-full p-2 border rounded" />
        <input name="cardholderName" placeholder="Cardholder Name" value={formData.cardholderName} onChange={handleInputChange} required className="mb-2 w-full p-2 border rounded" />
        <input name="cardNumber" placeholder="Card Number" value={formData.cardNumber} onChange={handleInputChange} required className="mb-2 w-full p-2 border rounded" />
        <input name="expiryDate" placeholder="Expiry Date (MM/YY)" value={formData.expiryDate} onChange={handleInputChange} required className="mb-2 w-full p-2 border rounded" />
        <input name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleInputChange} required className="mb-4 w-full p-2 border rounded" />
        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition">
          {loading ? 'Placing Order...' : 'Place Order'}
              </button>
        </form>
    </div>
  );
}