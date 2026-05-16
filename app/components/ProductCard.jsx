"use client";
import { useState } from 'react';
// import { useCart } from '../context/CartContext';
import { useCart } from './../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleQtyChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleAdd = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset card after adding
  };

  return (
    <div className="card" style={{ cursor: 'default' }}>
      <img src={product.image} alt={product.name} />
      <div className="card-info">
        <h3 style={{ color: 'var(--primary-dark)' }}>{product.name}</h3>
        <ul style={{ margin: '1rem 0', paddingLeft: '1.2rem', color: '#555', flex: 1 }}>
          {product.details.map((detail, idx) => (
            <li key={idx}>{detail}</li>
          ))}
        </ul>

        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-dark)', textAlign: 'center', marginBottom: '1rem' }}>
          ₹{product.basePrice * quantity}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-color)', padding: '10px', borderRadius: '8px', marginBottom: '1rem' }}>
          <button style={btnStyle} onClick={() => handleQtyChange(-1)}>-</button>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{quantity}</span>
          <button style={btnStyle} onClick={() => handleQtyChange(1)}>+</button>
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

const btnStyle = { backgroundColor: 'var(--primary-mid)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' };