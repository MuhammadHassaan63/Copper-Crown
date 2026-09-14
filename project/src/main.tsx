import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { RouterProvider } from '@/context/RouterContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  </StrictMode>
);
