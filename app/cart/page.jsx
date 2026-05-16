"use client";
// import { useCart } from '@/context/CartContext';
import { useCart } from './../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { cart, removeFromCart, grandTotal } = useCart();
  const router = useRouter(); 

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart }),
      });
      
      if (response.status === 401) {
          alert("You must be logged in to place an order! Redirecting to login...");
          router.push('/login');
          return;
      }

      const session = await response.json();
      
      if (session.error) {
        alert(session.error);
        return;
      }

      // NEW: Redirect standard browser way, no Stripe.js needed!
      if (session.url) {
          window.location.href = session.url;
      }
      
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--primary-dark)' }}>Your Cart is Empty</h2>
        <br />
        <Link href="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="cart-container">
        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2rem' }}>Checkout</h2>
        {cart.map((item, index) => (
          <div key={index} className="cart-item">
            <div>
              <h4 style={{ color: 'var(--primary-dark)' }}>{item.name}</h4>
              <p>₹{item.basePrice} x {item.quantity}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <strong>₹{item.basePrice * item.quantity}</strong>
              <button 
                onClick={() => removeFromCart(index)} 
                style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >X</button>
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '2rem', color: 'var(--primary-dark)' }}>
          Grand Total: ₹{grandTotal}
        </div>
        <button className="btn-primary" onClick={handleCheckout} style={{ width: '100%', marginTop: '20px', fontSize: '1.2rem' }}>
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}