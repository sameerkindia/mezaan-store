"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
            // FIX: Hard redirect updates the Navbar Auth instantly
            window.location.href = '/shop';
        } else {
            const data = await res.json();
            setError(data.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh', fontFamily: 'sans-serif' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2 style={{ textAlign: 'center', color: '#355872' }}>Customer Login</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <input type="email" placeholder="Email Address" required onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px' }} />
                <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', background: '#7AAACE', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
                <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem' }}>
                    Need an account? <Link href="/signup" style={{ color: '#355872', fontWeight: 'bold' }}>Sign up</Link>
                </p>
            </form>
        </div>
    );
}