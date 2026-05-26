import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import ClientSidebar from '../components/ClientSidebar';
import ChatAssistant from '../components/ChatAssistant';
import CartModal from '../components/CartModal';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveShell from './ResponsiveShell';

const CART_STORAGE_KEY = 'petfood_cart';

const readStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const ClientLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const chatKey = user?._id || user?.id || 'client';
  const [cart, setCart] = useState(readStoredCart);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const handleAddToCart = (event) => {
      const product = event.detail;
      if (!product) return;

      setCart((current) => {
        const productId = product._id || product.id;
        const incomingStock = Number(product?.stock ?? product?.quantity ?? product?.availableStock ?? product?.available ?? 0);

        const existing = current.find((item) => (item._id || item.id) === productId);

        if (existing) {
          const currentQty = Number(existing.quantity || 1);
          const nextQty = Math.min(currentQty + 1, incomingStock || currentQty + 1);
          return current.map((item) =>
            (item._id || item.id) === productId
              ? { ...item, quantity: nextQty }
              : item
          );
        }

        return [...current, { ...product, productId, quantity: 1 }];
      });


      setShowCart(true);
    };

    const clearCart = () => {
      setCart([]);
      setShowCart(false);
    };

    window.addEventListener('addToCart', handleAddToCart);
    window.addEventListener('petfood:clear-cart', clearCart);
    return () => {
      window.removeEventListener('addToCart', handleAddToCart);
      window.removeEventListener('petfood:clear-cart', clearCart);
    };
  }, []);

  const total = useMemo(
    () => Number(cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0).toFixed(2)),
    [cart]
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [cart]
  );

  const openCheckout = () => {
    setShowCart(false);
    if (location.pathname !== '/checkout') {
      navigate('/checkout');
    }
  };

  return (
    <ResponsiveShell
      roleBadge="Espace client"
      sidebar={(onClose) => <ClientSidebar onLogout={logout} onNavigate={onClose} />}
    >
      {children}
      <button
        type="button"
        onClick={() => setShowCart(true)}
        style={styles.cartButton}
        aria-label="Ouvrir le panier"
      >
        <ShoppingCart size={20} />
        {itemCount > 0 && <span style={styles.cartBadge}>{itemCount}</span>}
      </button>
      {showCart && (
        <CartModal
          cart={cart}
          total={total.toFixed(2)}
          onClose={() => setShowCart(false)}
          onCheckout={openCheckout}
        />
      )}
      <ChatAssistant key={chatKey} variant="client" />
    </ResponsiveShell>
  );
};

const styles = {
  cartButton: {
    position: 'fixed',
    right: '24px',
    bottom: '92px',
    zIndex: 900,
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: 'none',
    background: '#10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(16,185,129,0.35)',
    cursor: 'pointer',
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '999px',
    background: '#dc2626',
    color: 'white',
    fontSize: '12px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default ClientLayout;
