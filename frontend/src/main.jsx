import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ShopContextProvider from './Context/ShopContext.jsx';

// Dispara PageView a cada mudança de rota (SPA)
function PixelRouteTracker() {
  const location = useLocation();
  const lastPathRef = useRef('');

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;

    // evita disparos duplicados imediatos em dev (ex.: StrictMode)
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ShopContextProvider>
      <PixelRouteTracker />
      <App />
    </ShopContextProvider>
  </BrowserRouter>
);
