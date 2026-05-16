"use client";
import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Whenever the app loads, check if someone is logged in
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user); // Save the user/admin details
                    }
                }
            } catch (error) {
                console.error("Failed to check session:", error);
            } finally {
                setLoading(false); // Stop the loading state
            }
        };

        checkUserSession();
    }, []);

    // The logout function to clear cookies and reset the state
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null); // Instantly remove the user from the screen
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// A custom hook so other files can easily grab the user data
export const useAuth = () => useContext(AuthContext);