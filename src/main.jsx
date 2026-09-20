import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import './styles/index.css';

// Store-subdomain host routing: visiting https://{slug}.go.julex.shop/
// renders that merchant's storefront. nginx already proxies the request to
// /store/{slug} server-side; this maps the client route before React boots.
(() => {
  try {
    const m = /^([a-z0-9]+)\.go\.julex\.shop$/.exec(window.location.hostname);
    if (m && m[1] !== 'go' && window.location.pathname === '/') {
      window.history.replaceState({}, '', `/store/${m[1]}`);
    }
  } catch (e) {}
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
