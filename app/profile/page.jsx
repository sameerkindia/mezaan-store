"use client";
import { useEffect, useState } from 'react';
import { useAuth } from './../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Fetch this specific user's order history
      fetch('/api/user/orders')
        .then(res => res.json())
        .then(data => setOrders(data.orders || []));
    }
  }, [user, loading, router]);

  if (loading || !user) return <div style={styles.container}>Loading Profile...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <div style={styles.avatarLarge}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
        <div>
          <h1 style={styles.name}>{user.name || 'Customer'}</h1>
          <p style={styles.email}>{user.email}</p>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>My Order History</h2>
      
      {orders.length === 0 ? (
        <div style={styles.emptyState}>You haven't placed any orders yet.</div>
      ) : (
        <div style={styles.grid}>
          {orders.map((order, index) => (
            <div key={index} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <span style={styles.orderId}>Order {order.id}</span>
                <span style={{
                  ...styles.statusBadge,
                  background: order.status === 'Delivered' ? '#d1fae5' : order.status === 'Shipped' ? '#dbeafe' : '#fef3c7',
                  color: order.status === 'Delivered' ? '#065f46' : order.status === 'Shipped' ? '#1e40af' : '#92400e'
                }}>
                  {order.status}
                </span>
              </div>
              <p style={styles.orderDate}>Placed on: {order.date}</p>
              
              <div style={styles.itemList}>
                {order.items?.map((item, i) => (
                  <div key={i} style={styles.itemRow}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.basePrice * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div style={styles.orderTotal}>Total: ₹{order.total.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' },
  headerCard: { display: 'flex', alignItems: 'center', gap: '2rem', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '3rem' },
  avatarLarge: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-dark)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold' },
  name: { color: 'var(--primary-dark)', marginBottom: '0.5rem' },
  email: { color: '#6b7280', fontSize: '1.1rem' },
  sectionTitle: { color: 'var(--primary-dark)', marginBottom: '1.5rem' },
  emptyState: { background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '10px', color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  orderCard: { background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  orderId: { fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-dark)' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
  orderDate: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' },
  itemList: { borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', margin: '1rem 0' },
  itemRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#374151', fontSize: '0.95rem' },
  orderTotal: { textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-dark)' }
};