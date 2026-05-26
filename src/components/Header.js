import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Header = ({ title, cartCount, onCartClick, onLogout, user, isAdmin }) => {
  const location = useLocation();

  const displayName = isAdmin ? (user?.name || 'El JEzi Ghassen') : (user?.name || 'Utilisateur');

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to={isAdmin ? '/admin/dashboard' : '/client-products'} style={styles.logo}>
          <div style={styles.logoIcon}>🐾</div>
          <span style={styles.logoText}>{title}</span>
        </Link>

        {/* Navigation */}
        <nav style={styles.nav}>
          {!isAdmin ? (
            <>
              <Link to="/client-products" style={getNavStyle(location.pathname === '/client-products')}>Produits</Link>
              <Link to="/client-orders" style={getNavStyle(location.pathname === '/client-orders')}>Commandes</Link>
              <Link to="/client-invoices" style={getNavStyle(location.pathname === '/client-invoices')}>Factures</Link>
              <Link to="/client-reviews" style={getNavStyle(location.pathname === '/client-reviews')}>⭐ Avis</Link>
              <Link to="/client-complaints" style={getNavStyle(location.pathname === '/client-complaints')}>⚠️ Réclamations</Link>
              <Link to="/store-locator" style={getNavStyle(location.pathname === '/store-locator')}>📍 Localisation</Link>
              <Link to="/pet-advice" style={getNavStyle(location.pathname === '/pet-advice')}>🐾 Conseils</Link>
              <Link to="/veterinary" style={getNavStyle(location.pathname === '/veterinary')}>🩺 Vétérinaire</Link>
              <Link to="/contact" style={getNavStyle(location.pathname === '/contact')}>Contact</Link>
            </>
          ) : (
            <span style={styles.adminLabel}>👑 Espace Administrateur</span>
          )}
        </nav>

        {/* Right Section */}
        <div style={styles.rightSection}>
          {!isAdmin && <NotificationBell />}

          {!isAdmin && (
            <button onClick={onCartClick} style={styles.cartBtn}>
              <span style={{ fontSize: '1.1rem' }}>🛒</span>
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </button>
          )}

          <div style={styles.userSection}>
            {!isAdmin && (
              <Link to="/client-profile" style={styles.avatar} title="Mon Profil">
                <img
                  src={getUserAvatarUrl(user)}
                  alt={`Avatar de ${displayName}`}
                  style={styles.avatarImage}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span style={styles.avatarInitials}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              </Link>
            )}
            {isAdmin && (
              <div style={{ ...styles.avatar, background: 'linear-gradient(135deg, #e67e22, #d35400)' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={styles.userName}>{displayName}</span>
          </div>

          <button onClick={onLogout} style={styles.logoutBtn} title="Déconnexion">
            <span style={{ fontSize: '1rem' }}>🚪</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const getNavStyle = (isActive) => ({
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  color: isActive ? '#d35400' : '#666',
  background: isActive ? 'rgba(230, 126, 34, 0.1)' : 'transparent',
  border: isActive ? '1px solid rgba(230, 126, 34, 0.2)' : '1px solid transparent',
});

const getUserAvatarUrl = (user) => {
  const seed = encodeURIComponent((user?.name || user?.email || 'client').trim());
  return `https://api.dicebear.com/6.x/adventurer/svg?seed=${seed}&backgroundType=gradientLinear&backgroundColor=F8FAFC,DBEAFE&radius=50`;
};

const styles = {
  header: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    padding: '0 24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  avatarImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    zIndex: 1,
  },
  avatarInitials: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.02em',
    background: 'linear-gradient(135deg, rgba(230,126,34,0.85), rgba(211,84,0,0.85))',
    borderRadius: '50%',
    zIndex: 0,
  },
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.02em',
    background: 'linear-gradient(135deg, rgba(230,126,34,0.85), rgba(211,84,0,0.85))',
    borderRadius: '50%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    transition: 'transform 0.3s ease',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #e67e22, #d35400)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.25)',
  },
  logoText: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#d35400',
    letterSpacing: '-0.3px',
  },
  nav: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  adminLabel: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#e67e22',
    background: 'rgba(230,126,34,0.1)',
    padding: '6px 14px',
    borderRadius: '20px',
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  cartBtn: {
    position: 'relative',
    background: 'rgba(230, 126, 34, 0.08)',
    border: '1px solid rgba(230, 126, 34, 0.15)',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#d35400',
    transition: 'all 0.3s ease',
  },
  cartBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#e74c3c',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    position: 'relative',
    overflow: 'hidden',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 10px rgba(39, 174, 96, 0.2)',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#444',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'rgba(231, 76, 60, 0.08)',
    border: '1px solid rgba(231, 76, 60, 0.15)',
    borderRadius: '12px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#e74c3c',
    transition: 'all 0.3s ease',
  },
};

export default Header;
