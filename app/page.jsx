"use client";
import Link from 'next/link';

export default function Home() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent! We will contact you shortly.");
    e.target.reset();
  };

  return (
    <>
      <div className="hero-banner">
        <h1>Building the Future with Precision</h1>
        <p>Your trusted manufacturer for high-quality POP sections, channels, and angles.</p>
        <Link href="/shop" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Explore Our Shop</Link>
      </div>

      <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--primary-dark)' }}>About Meezan Enterprises</h2>
        <p style={{ color: '#555', marginTop: '1rem', lineHeight: '1.6', maxWidth: '800px', margin: '1rem auto' }}>
          Based in our state-of-the-art factory, we specialize in the production of high-grade Plaster of Paris (POP) sections. 
          Our mission is to provide the backbone for beautiful interiors.
        </p>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid #ddd', maxWidth: '800px', margin: '0 auto' }} />

      <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--primary-dark)' }}>Get in Touch</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea rows="4" placeholder="How can we help you?" required></textarea>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
        </form>
      </div>
    </>
  );
}