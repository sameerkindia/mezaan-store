"use client";
import Link from 'next/link';
import { useCart } from './../context/CartContext';
import { useAuth } from './../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/login');
  };

  // Safely extract the First Name and Initial
  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');
  const firstLetter = firstName.charAt(0).toUpperCase();

  return (
    <nav style={styles.navbar}>
      <Link href="/" style={styles.logo}>Meezan Enterprises</Link>
      
      <ul style={styles.navLinks}>
        <li><Link href="/" style={styles.link}>Home</Link></li>
        <li><Link href="/shop" style={styles.link}>Shop</Link></li>
        
        {user ? (
          <>
            {/* Admin Link (Only visible to admins) */}
            {user.role === 'admin' && (
              <li>
                <Link href="/admin" style={styles.adminLink}>
                  Admin Panel
                </Link>
              </li>
            )}
            
            {/* User Profile & Dropdown */}
            <li style={{ position: 'relative' }}>
              <div style={styles.userContainer} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div style={styles.avatar}>{firstLetter}</div>
                <span style={styles.userName}>{firstName} ▼</span>
              </div>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <button onClick={handleSignOut} style={styles.logoutBtn}>
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          </>
        ) : (
          <li><Link href="/login" style={styles.loginBtn}>Login</Link></li>
        )}

        <li>
          <Link href="/cart" style={styles.link}>
            Cart <span style={styles.badge}>{totalItems}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

const styles = {
  navbar: { backgroundColor: 'var(--primary-dark)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  logo: { color: 'var(--white)', fontSize: '1.5rem', fontWeight: 'bold' },
  navLinks: { listStyle: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center' },
  link: { color: 'var(--white)', fontWeight: '500' },
  adminLink: { color: '#f59e0b', fontWeight: 'bold' },
  badge: { backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginLeft: '5px' },
  
  userContainer: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem' },
  userName: { color: 'var(--primary-light)', fontSize: '0.9rem', fontWeight: '500' },
  
  dropdown: { position: 'absolute', top: '120%', right: '0', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', padding: '0.5rem', minWidth: '120px', zIndex: 200 },
  logoutBtn: { width: '100%', padding: '8px', backgroundColor: '#ef4444', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
  loginBtn: { backgroundColor: 'var(--primary-mid)', padding: '6px 15px', borderRadius: '5px', color: 'var(--white)', fontWeight: 'bold', cursor: 'pointer' }
};