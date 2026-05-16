"use client";
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DYNAMIC DATA ON LOAD
  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  // GLOBAL DATABASE MUTATION FUNCTION
  const mutateData = async (action, payload) => {
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    const updatedData = await res.json();
    setProducts(updatedData.products);
    setOrders(updatedData.orders);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login'; // Hard redirect for clean logout
  };

  // --- ACTIONS ---
  const handleAddProduct = () => {
    const name = prompt("Enter Product Name:");
    const price = prompt("Enter Price (₹):");
    if (name && price) mutateData('ADD_PRODUCT', { name, price: Number(price) });
  };

  const handleEditProduct = (id) => {
    const newPrice = prompt("Enter new price (₹):");
    if (newPrice) mutateData('EDIT_PRODUCT', { id, price: Number(newPrice) });
  };

  const handleDeleteProduct = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      mutateData('DELETE_PRODUCT', { id });
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  if (loading) return <div style={{ padding: '3rem' }}>Loading Admin Data...</div>;

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Admin Portal</h2>
        <ul style={styles.sidebarMenu}>
          <li onClick={() => setActiveTab('dashboard')} style={activeTab === 'dashboard' ? styles.activeTab : styles.inactiveTab}>📊 Overview</li>
          <li onClick={() => setActiveTab('products')} style={activeTab === 'products' ? styles.activeTab : styles.inactiveTab}>📦 Products</li>
          <li onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? styles.activeTab : styles.inactiveTab}>🛒 Orders</li>
        </ul>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={styles.pageHeader}>Business Overview</h1>
            <div style={styles.grid}>
              <div style={styles.card}>
                <p style={styles.cardLabel}>TOTAL REVENUE</p>
                <h2 style={styles.cardValue}>₹{totalRevenue.toLocaleString()}</h2>
              </div>
              <div style={styles.card}>
                <p style={styles.cardLabel}>TOTAL ORDERS</p>
                <h2 style={styles.cardValue}>{orders.length}</h2>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div style={styles.headerRow}>
              <h1 style={styles.pageHeader}>Manage Products</h1>
              <button onClick={handleAddProduct} style={styles.addBtn}>+ Add Product</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>Product Name</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Stock</th>
                    <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.tdBold}>{p.name}</td>
                      <td style={styles.td}>₹{p.price}</td>
                      <td style={styles.td}>{p.stock}</td>
                      <td style={{...styles.td, textAlign: 'right'}}>
                        <button onClick={() => handleEditProduct(p.id)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <h1 style={styles.pageHeader}>Live Sales & Orders</h1>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={styles.tr}>
                      <td style={styles.tdBold}>{o.id}</td>
                      <td style={styles.td}>{o.customer}</td>
                      <td style={styles.td}>₹{o.total.toLocaleString()}</td>
                      <td style={styles.td}>
                        <select 
                          value={o.status} 
                          onChange={(e) => mutateData('UPDATE_ORDER_STATUS', { id: o.id, status: e.target.value })}
                          style={{ padding: '6px', cursor: 'pointer' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Same styles object from before
const styles = {
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' },
  sidebar: { width: '250px', backgroundColor: '#111827', color: 'white', padding: '2rem', display: 'flex', flexDirection: 'column' },
  sidebarTitle: { fontSize: '1.5rem', marginBottom: '2rem', color: '#60a5fa' },
  sidebarMenu: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 },
  activeTab: { cursor: 'pointer', color: 'white', fontWeight: 'bold' },
  inactiveTab: { cursor: 'pointer', color: '#9ca3af', fontWeight: 'normal' },
  logoutBtn: { marginTop: 'auto', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  mainContent: { flex: 1, padding: '3rem', color: '#111827' },
  pageHeader: { marginBottom: '2rem', marginTop: 0 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' },
  card: { background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  cardLabel: { color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold' },
  cardValue: { fontSize: '2.5rem', margin: '10px 0' },
  tableContainer: { background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHead: { background: '#f3f4f6' },
  th: { padding: '1rem', color: '#374151' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem' },
  tdBold: { padding: '1rem', fontWeight: 'bold' },
  addBtn: { background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  editBtn: { marginRight: '10px', background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' },
  deleteBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' },
};