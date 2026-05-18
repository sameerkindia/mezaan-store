"use client";
import { useState, useEffect } from 'react';
import { useAuth } from './../context/AuthContext';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // --- CUSTOM DIALOG STATE (Replaces window.alert / prompt) ---
  const [dialog, setDialog] = useState({ isOpen: false, type: '', message: '', input: '', onConfirm: null });

  // --- FORM STATES ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({ id: null, name: '', price: '', stock: '', category: '', image: '' });

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ oldName: null, name: '' });

  // SECURITY
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) window.location.href = '/login';
  }, [user, authLoading]);

  // FETCH DATA
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/admin/data')
        .then(res => res.json())
        .then(data => {
          setProducts(data.products || []);
          setOrders(data.orders || []);
          setUsers(data.users || []);
          setCategories(data.categories || []);
          setDataLoading(false);
        });
    }
  }, [user]);

  const mutateData = async (action, payload) => {
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    const updated = await res.json();
    setProducts(updated.products);
    setOrders(updated.orders);
    setUsers(updated.users);
    setCategories(updated.categories);
  };

  // --- CUSTOM DIALOG HELPERS ---
  const openConfirm = (message, onConfirm) => {
    setDialog({ isOpen: true, type: 'confirm', message, input: '', onConfirm });
  };
  
  const openPrompt = (message, defaultValue, onConfirm) => {
    setDialog({ isOpen: true, type: 'prompt', message, input: defaultValue, onConfirm });
  };
  
  const handleDialogSubmit = (e) => {
    e.preventDefault();
    if (dialog.onConfirm) dialog.onConfirm(dialog.type === 'prompt' ? dialog.input : true);
    setDialog({ isOpen: false, type: '', message: '', input: '', onConfirm: null });
  };

  // --- MODERATION ACTIONS ---
  const handleBanUser = (id) => {
    openPrompt("Enter ban duration in hours (e.g., 24):", "24", (val) => {
      if (val && !isNaN(val)) mutateData('BAN_USER', { id, hours: Number(val) });
    });
  };

  const handleMakeAdmin = (id) => {
    openConfirm("Promote this user to Admin?", () => mutateData('MAKE_ADMIN', { id }));
  };

  const handleDeleteUser = (id) => {
    openConfirm("Permanently delete this user?", () => mutateData('DELETE_USER', { id }));
  };

  // --- CATEGORY ACTIONS ---
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (catForm.oldName) mutateData('EDIT_CATEGORY', { oldName: catForm.oldName, newName: catForm.name });
    else mutateData('ADD_CATEGORY', { name: catForm.name });
    setIsCatModalOpen(false);
  };

  // --- PRODUCT ACTIONS ---
  const handleSaveProduct = (e) => {
    e.preventDefault();
    const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) };
    if (productForm.id) mutateData('EDIT_PRODUCT', payload);
    else mutateData('ADD_PRODUCT', payload);
    setIsProductModalOpen(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (authLoading || dataLoading || !user || user.role !== 'admin') {
    return <div style={{ padding: '3rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Verifying Security & Loading...</div>;
  }

  return (
    <div style={styles.layout}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Admin Portal</h2>
        <ul style={styles.sidebarMenu}>
          <li onClick={() => setActiveTab('dashboard')} style={activeTab === 'dashboard' ? styles.activeTab : styles.inactiveTab}>📊 Overview</li>
          <li onClick={() => setActiveTab('categories')} style={activeTab === 'categories' ? styles.activeTab : styles.inactiveTab}>📁 Categories</li>
          <li onClick={() => setActiveTab('products')} style={activeTab === 'products' ? styles.activeTab : styles.inactiveTab}>📦 Products</li>
          <li onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? styles.activeTab : styles.inactiveTab}>🛒 Orders</li>
          <li onClick={() => setActiveTab('users')} style={activeTab === 'users' ? styles.activeTab : styles.inactiveTab}>👥 Users</li>
        </ul>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={styles.pageHeader}>Business Overview</h1>
            <div style={styles.grid}>
              <div style={styles.card}>
                <p style={styles.cardLabel}>TOTAL REVENUE</p>
                <h2 style={styles.cardValue}>₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</h2>
              </div>
              <div style={styles.card}>
                <p style={styles.cardLabel}>REGISTERED USERS</p>
                <h2 style={styles.cardValue}>{users.length}</h2>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {activeTab === 'categories' && (
          <div>
            <div style={styles.headerRow}>
              <h1 style={styles.pageHeader}>Manage Categories</h1>
              <button onClick={() => { setCatForm({ oldName: null, name: '' }); setIsCatModalOpen(true); }} style={styles.addBtn}>+ Add Category</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>Category Name</th>
                    <th style={styles.th}>Total Products</th>
                    <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => {
                    const productCount = products.filter(p => p.category === c).length;
                    return (
                      <tr key={c} style={styles.tr}>
                        <td style={styles.tdBold}>{c}</td>
                        <td style={styles.td}>{productCount} Products</td>
                        <td style={{...styles.td, textAlign: 'right'}}>
                          <button onClick={() => { setCatForm({ oldName: c, name: c }); setIsCatModalOpen(true); }} style={styles.editBtn}>Edit</button>
                          <button onClick={() => openConfirm(`Delete category "${c}"? Products will become Uncategorized.`, () => mutateData('DELETE_CATEGORY', { name: c }))} style={styles.deleteBtn}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div style={styles.headerRow}>
              <h1 style={styles.pageHeader}>Manage Products</h1>
              <button onClick={() => { setProductForm({ id: null, name: '', price: '', stock: '', category: categories[0] || '', image: '' }); setIsProductModalOpen(true); }} style={styles.addBtn}>+ Add Product</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price</th>
                    <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.tdBold}>{p.name}</td>
                      <td style={styles.td}>{p.category}</td>
                      <td style={styles.td}>₹{p.price}</td>
                      <td style={{...styles.td, textAlign: 'right'}}>
                        <button onClick={() => { setProductForm({ ...p }); setIsProductModalOpen(true); }} style={styles.editBtn}>Edit</button>
                        <button onClick={() => openConfirm(`Are you sure you want to delete ${p.name}?`, () => mutateData('DELETE_PRODUCT', { id: p.id }))} style={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ORDERS */}
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
                          style={{ padding: '6px', cursor: 'pointer', borderRadius: '3px', border: '1px solid #ccc', background: o.status === 'Delivered' ? '#d1fae5' : o.status === 'Shipped' ? '#dbeafe' : '#fef3c7' }}
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

        {/* TAB: USERS */}
        {activeTab === 'users' && (
          <div>
            <h1 style={styles.pageHeader}>User Management</h1>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Status</th>
                    <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isBanned = u.banUntil && u.banUntil > Date.now();
                    const isAdmin = u.role === 'admin';
                    return (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.tdBold}>
                          {u.name} 
                          {isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          {isBanned ? <span style={{color: 'red', fontWeight: 'bold'}}>Banned</span> : 'Active'}
                        </td>
                        <td style={{...styles.td, textAlign: 'right'}}>
                          {!isAdmin && <button onClick={() => handleMakeAdmin(u.id)} style={styles.editBtn}>Make Admin</button>}
                          
                          {/* BAN / UNBAN TOGGLE */}
                          {!isAdmin && isBanned ? (
                            <button onClick={() => openConfirm(`Unban ${u.name}?`, () => mutateData('UNBAN_USER', { id: u.id }))} style={styles.unbanBtn}>Unban</button>
                          ) : !isAdmin ? (
                            <button onClick={() => handleBanUser(u.id)} style={styles.banBtn}>Ban User</button>
                          ) : null}
                          
                          {!isAdmin && <button onClick={() => handleDeleteUser(u.id)} style={styles.deleteBtn}>Delete</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- CUSTOM DIALOG POPUP --- */}
      {dialog.isOpen && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleDialogSubmit} style={styles.dialogContent}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>{dialog.message}</h3>
            
            {dialog.type === 'prompt' && (
              <input 
                autoFocus required type="text" 
                value={dialog.input} 
                onChange={e => setDialog({...dialog, input: e.target.value})} 
                style={styles.input} 
              />
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" style={{...styles.addBtn, flex: 1}}>Confirm</button>
              <button type="button" onClick={() => setDialog({ isOpen: false })} style={{...styles.deleteBtn, flex: 1}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* --- CATEGORY FORM MODAL --- */}
      {isCatModalOpen && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSaveCategory} style={styles.modalContent}>
            <h2 style={{marginTop: 0}}>{catForm.oldName ? 'Edit Category' : 'Add Category'}</h2>
            <input autoFocus required type="text" placeholder="Category Name" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} style={styles.input} />
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
              <button type="submit" style={{...styles.addBtn, flex: 1}}>Save</button>
              <button type="button" onClick={() => setIsCatModalOpen(false)} style={{...styles.deleteBtn, flex: 1}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* --- PRODUCT FORM MODAL --- */}
      {isProductModalOpen && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSaveProduct} style={styles.modalContent}>
            <h2 style={{marginTop: 0}}>{productForm.id ? 'Edit Product' : 'Add Product'}</h2>
            
            <input required type="text" placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={styles.input} />
            
            <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} style={styles.input}>
              <option value="" disabled>Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <div style={{display: 'flex', gap: '10px'}}>
              <input required type="number" placeholder="Price (₹)" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={styles.input} />
              <input required type="number" placeholder="Stock" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} style={styles.input} />
            </div>

            <input required type="url" placeholder="Image URL (https://...)" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} style={styles.input} />
            
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
              <button type="submit" style={{...styles.addBtn, flex: 1}}>Save Product</button>
              <button type="button" onClick={() => setIsProductModalOpen(false)} style={{...styles.deleteBtn, flex: 1}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// --- STYLES ---
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
  
  adminBadge: { background: 'linear-gradient(45deg, #f59e0b, #ef4444)', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '10px', boxShadow: '0 2px 5px rgba(245, 158, 11, 0.4)' },
  
  addBtn: { background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  editBtn: { marginRight: '10px', background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' },
  banBtn: { marginRight: '10px', background: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' },
  unbanBtn: { marginRight: '10px', background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' },
  deleteBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '10px', width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  dialogContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '10px', width: '350px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', boxSizing: 'border-box' }
};