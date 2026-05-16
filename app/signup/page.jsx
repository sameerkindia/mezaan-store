"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        if (res.ok) {
            router.push('/shop'); // Redirect to shop after successful signup
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh', fontFamily: 'sans-serif' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2 style={{ textAlign: 'center', color: '#355872' }}>Create Account</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                
                <input type="text" placeholder="Full Name" required 
                    onChange={(e) => setName(e.target.value)} style={{ padding: '10px' }} />
                <input type="email" placeholder="Email Address" required 
                    onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px' }} />
                <input type="password" placeholder="Password (min 6 chars)" required minLength={6}
                    onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px' }} />
                    
                <button type="submit" style={{ padding: '10px', background: '#7AAACE', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</button>
                
                <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem' }}>
                    Already have an account? <Link href="/login" style={{ color: '#355872', fontWeight: 'bold' }}>Log in</Link>
                </p>
            </form>
        </div>
    );
}