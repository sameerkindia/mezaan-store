"use client";
import { useState } from 'react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
            // FIX: Hard redirect forces the Navbar to see the new cookie!
            window.location.href = '/admin'; 
        } else {
            const data = await res.json();
            setError(data.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh', fontFamily: 'sans-serif' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
                <h2>Admin Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input type="email" placeholder="afroj@admin.com" required onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px' }} />
                <input type="password" placeholder="Password (12341234)" required onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', background: '#f59e0b', color: 'white', fontWeight: 'bold' }}>Login to Dashboard</button>
            </form>
        </div>
    );
}