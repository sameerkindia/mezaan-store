"use client";
import { useEffect, useState } from 'react';
// import ProductCard from '../../components/ProductCard';
import ProductCard from '@/app/components/ProductCard';

export default function Shop() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  if (selectedCategory) {
    return (
      <div className="container">
        <button className="btn-primary" onClick={() => setSelectedCategory(null)} style={{ marginBottom: '20px' }}>
          &larr; Back to Categories
        </button>
        <h2 style={{ color: 'var(--primary-dark)' }}>{selectedCategory.name}</h2>
        <div className="grid">
          {selectedCategory.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ color: 'var(--primary-dark)', textAlign: 'center' }}>Product Categories</h2>
      <div className="grid">
        {categories.map(cat => (
          <div key={cat.id} className="card" onClick={() => setSelectedCategory(cat)}>
            <img src={cat.image} alt={cat.name} />
            <div className="card-info" style={{ alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--primary-dark)' }}>{cat.name}</h3>
              <p style={{ margin: '10px 0', color: '#555' }}>{cat.description}</p>
              <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }}>View Products</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}