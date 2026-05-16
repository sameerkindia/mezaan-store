import './globals.css';

// Using relative paths since your folders are inside the 'app' directory
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Meezan Enterprises | Premium POP Sections',
  description: 'Leading manufacturers of premium POP sections.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* AuthProvider MUST wrap everything so Navbar and Pages can read the user data */}
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main id="app-container">{children}</main>
            <footer style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--primary-light)', padding: '2rem', textAlign: 'center', marginTop: 'auto' }}>
              <p>&copy; 2026 Meezan Enterprises. All Rights Reserved.</p>
              <p style={{ marginTop: '10px' }}>📍 Industrial Area, Phase II | 📞 +91 98765 43210</p>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}