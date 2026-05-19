"use client";
import { useState, useEffect } from 'react';
import { useCart } from './../context/CartContext';
import { useAuth } from './../context/AuthContext';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  // Custom Popup State
  const [dialog, setDialog] = useState({ isOpen: false, message: '', isError: false });

  useEffect(() => {
    // Fetch live products and categories from our database
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    // 1. BAN CHECK
    if (user && user.banUntil && user.banUntil > Date.now()) {
      const hoursLeft = Math.ceil((user.banUntil - Date.now()) / (1000 * 60 * 60));
      setDialog({ isOpen: true, message: `Your account is banned. Try again in ${hoursLeft} hours.`, isError: true });
      return;
    }

    // 2. SUCCESSFUL ADD
    addToCart({ ...product, basePrice: product.price }); // mapping price to basePrice for cart context
    setDialog({ isOpen: true, message: `${product.name} has been added to your cart!`, isError: false });
  };

  if (loading) return <div style={styles.container}><h2>Loading Products...</h2></div>;

  // Filter products by active category
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Shop Our Products</h1>

      {/* Category Filters */}
      <div style={styles.filterContainer}>
        <button 
          onClick={() => setActiveCategory('All')} 
          style={activeCategory === 'All' ? styles.activeFilterBtn : styles.filterBtn}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            style={activeCategory === cat ? styles.activeFilterBtn : styles.filterBtn}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={styles.grid}>
        {filteredProducts.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280' }}>No products found in this category.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} style={styles.card}>
              <div style={styles.imageContainer}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={styles.image} />
                ) : (
                  <div style={styles.noImage}>No Image</div>
                )}
              </div>
              <div style={styles.cardContent}>
                <span style={styles.categoryBadge}>{product.category}</span>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.price}>₹{product.price}</p>
                <p style={styles.stock}>{product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}</p>
                <button 
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(product)} 
                  style={product.stock > 0 ? styles.addToCartBtn : styles.disabledBtn}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CUSTOM POPUP (Replaces alert) */}
      {dialog.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: dialog.isError ? '#ef4444' : 'var(--primary-dark)' }}>
              {dialog.isError ? 'Action Blocked' : 'Success'}
            </h3>
            <p>{dialog.message}</p>
            <button onClick={() => setDialog({ isOpen: false })} style={styles.closeModalBtn}>Okay</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' },
  title: { color: 'var(--primary-dark)', textAlign: 'center', marginBottom: '2rem' },
  
  filterContainer: { display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '3rem' },
  filterBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: '500', color: '#374151' },
  activeFilterBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', background: 'var(--primary-mid)', cursor: 'pointer', fontWeight: 'bold', color: 'white' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  card: { background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  imageContainer: { width: '100%', height: '200px', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: { color: '#9ca3af', fontWeight: 'bold' },
  
  cardContent: { padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 },
  categoryBadge: { fontSize: '0.75rem', background: '#e5e7eb', color: '#4b5563', padding: '3px 8px', borderRadius: '10px', alignSelf: 'flex-start', marginBottom: '10px', fontWeight: 'bold' },
  productName: { margin: '0 0 10px 0', color: 'var(--primary-dark)', fontSize: '1.2rem' },
  price: { margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' },
  stock: { color: '#6b7280', fontSize: '0.9rem', margin: '10px 0 auto 0' },
  
  addToCartBtn: { marginTop: '15px', background: 'var(--primary-mid)', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
  disabledBtn: { marginTop: '15px', background: '#d1d5db', color: '#6b7280', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'not-allowed' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '10px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  closeModalBtn: { marginTop: '20px', background: 'var(--primary-dark)', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }
};