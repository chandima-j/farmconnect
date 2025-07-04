import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const navigate = useNavigate();
  return (
    <div style={{ border: '2px solid red', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <h1 style={{ color: 'black', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Order Placed Successfully!</h1>
      <p style={{ color: '#374151', fontSize: '1.125rem', marginBottom: '2rem' }}>
        Thank you for your purchase. Your order has been received and is being processed.
      </p>
      <button
        onClick={() => navigate('/products')}
        style={{ padding: '0.75rem 1.5rem', background: '#059669', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
      >
        Continue Shopping
      </button>
    </div>
  );
} 