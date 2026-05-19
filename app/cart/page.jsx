"use client";
import { useState } from 'react';
import { useCart } from './../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { cart, removeFromCart, grandTotal } = useCart();
  const router = useRouter(); 

  // Custom Popup State
  const [dialog, setDialog] = useState({ isOpen: false, message: '', isError: false, redirect: null });

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart }),
      });
      
      const session = await response.json();

      if (response.status === 401) {
        setDialog({ isOpen: true, message: "You must be logged in to place an order!", isError: true, redirect: '/login' });
        return;
      }
      
      if (response.status === 403 || session.error) {
        setDialog({ isOpen: true, message: session.error || "Checkout blocked.", isError: true });
        return;
      }

      // Redirect standard browser way
      if (session.url) {
          window.location.href = session.url;
      }
      
    } catch (error) {
      console.error(error);
      setDialog({ isOpen: true, message: "Checkout failed. Please try again.", isError: true });
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
    if (dialog.redirect) router.push(dialog.redirect);
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--primary-dark)' }}>Your Cart is Empty</h2>
        <br />
        <Link href="/shop" style={{...styles.btn, display: 'inline-block', textDecoration: 'none'}}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem' }}>Checkout</h2>
        
        {cart.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <h4 style={{ color: 'var(--primary-dark)', margin: '0 0 5px 0' }}>{item.name}</h4>
              <p style={{ margin: 0, color: '#6b7280' }}>₹{item.basePrice} x {item.quantity}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>₹{item.basePrice * item.quantity}</strong>
              <button 
                onClick={() => removeFromCart(index)} 
                style={{ color: '#ef4444', border: 'none', background: '#fee2e2', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
              >✕</button>
            </div>
          </div>
        ))}
        
        <div style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '2rem', color: 'var(--primary-dark)' }}>
          Grand Total: ₹{grandTotal}
        </div>
        <button onClick={handleCheckout} style={{ ...styles.btn, width: '100%', marginTop: '20px', fontSize: '1.2rem', padding: '15px' }}>
          Proceed to Payment
        </button>
      </div>

      {/* CUSTOM POPUP (Replaces alert) */}
      {dialog.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: dialog.isError ? '#ef4444' : 'var(--primary-dark)' }}>
              {dialog.isError ? 'Notice' : 'Message'}
            </h3>
            <p>{dialog.message}</p>
            <button onClick={closeDialog} style={styles.closeModalBtn}>Okay</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const styles = {
  btn: { background: 'var(--primary-mid)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '10px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  closeModalBtn: { marginTop: '20px', background: 'var(--primary-dark)', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }
};