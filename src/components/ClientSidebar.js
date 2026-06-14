import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';

const petEmojis = {
  dog: '🐶',
  cat: '🐱',
  bird: '🐦',
  fish: '🐠',
  other: '🐾'
};

const petLabels = {
  dog: 'Chien',
  cat: 'Chat',
  bird: 'Oiseau',
  fish: 'Poisson',
  other: 'Autre'
};

const ClientSidebar = ({ onLogout, onNavigate }) => {
  const [sidebarImageError, setSidebarImageError] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    petType: '',
    petAge: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          petType: res.data.petType || '',
          petAge: res.data.petAge || null
        });
      } catch (error) {
        console.error('Profile fetch error in sidebar', error);
      }
    };
    fetchProfile();
  }, []);

  const sections = [
    {
      title: '🛒 Boutique',
      items: [
        { id: 'client-products', label: 'Produits', icon: '🏷️' },
        { id: 'client-favorites', label: 'Mes favoris', icon: '❤️' },
        { id: 'client-orders', label: 'Mes commandes', icon: '📦' },
        { id: 'client-invoices', label: 'Mes factures', icon: '🧾' },
        { id: 'client-history', label: 'Historique', icon: '📜' },
        { id: 'client-loyalty', label: 'Fidélité', icon: '🎁' },
      ]
    },
    {
      title: '📡 IoT & connecté',
      items: [
        { id: 'client-iot', label: 'Centre IoT', icon: '📡' },
        { id: 'pet-feeder', label: 'Distributeur IoT', icon: '🍽️' },
        { id: 'client-smart-water', label: 'Fontaine connectée', icon: '💧' },
        { id: 'client-smart-delivery', label: 'Livraison prédictive', icon: '🚚' },
        { id: 'client-traceability', label: 'Traçabilité blockchain', icon: '🔗' },
      ]
    },
    {
      title: '⭐ Avis & Réclamations',
      items: [
        { id: 'client-reviews', label: 'Mes avis', icon: '⭐' },
        { id: 'client-complaints', label: 'Réclamations', icon: '⚠️' },
        { id: 'client-returns', label: 'Demande de retour', icon: '↩️' },
      ]
    },
    {
      title: '🐾 Services PetfoodTN',
      items: [
        { id: 'client-pets', label: 'Mes animaux', icon: '🐾' },
        { id: 'client-events', label: 'Compétitions & cadeaux', icon: '🏆' },
        { id: 'platform-services', label: 'Catalogue services', icon: '📋' },
        { id: 'client-services', label: 'Mes services & SAV', icon: '✂️' },
        { id: 'client-pet-passport', label: 'Passeport numérique', icon: '🛂' },
        { id: 'pet-calories', label: 'Nutrition par animal', icon: '🥗' },
        { id: 'pet-advice', label: 'Conseils pour pets', icon: '💡' },
        { id: 'found-me', label: 'Retrouvé Moi', icon: '🔍' },
        { id: 'veterinary', label: 'Santé & Vétérinaire', icon: '🩺' },
        { id: 'medical-dossier', label: 'Dossier médical', icon: '📁' },
        { id: 'store-locator', label: 'Magasin le plus proche', icon: '📍' },
        { id: 'contact', label: 'Contact', icon: '📧' },
      ]
    },
    {
      title: '⚙️ Compte',
      items: [
        { id: 'client-profile', label: 'Mon profil', icon: '👤' },
        { id: 'change-password', label: 'Mot de passe', icon: '🔐' },
      ]
    }
  ];

  const petEmoji = petEmojis[profile.petType] || '🐾';
  const petLabel = petLabels[profile.petType] || null;

  return (
    <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }} aria-label="Navigation client">
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #e67e22, #d35400)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 4px 12px rgba(230,126,34,0.3)',
        }}>
          🐾
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>
            PetfoodTN
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 500 }}>
            Espace Client
          </span>
        </div>
      </div>

      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
        onClick={() => navigate('/client-profile')}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(230,126,34,0.04)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        title="Cliquez pour voir votre profil"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!sidebarImageError ? (
            <img 
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop&crop=face" 
              alt="Profile" 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(39,174,96,0.25)',
                flexShrink: 0,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              onError={() => setSidebarImageError(true)}
            />
          ) : (
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#27ae60,#2ecc71)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 4px 12px rgba(39,174,96,0.25)',
                flexShrink: 0
              }}
            >
              🛒 {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#333', lineHeight: 1.3 }}>
              {profile.name || 'Client'}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#888', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.email || ''}
            </p>
            {petLabel && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#e67e22', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{petEmoji}</span>
                <span>{petLabel}{profile.petAge ? ` • ${profile.petAge} an${profile.petAge > 1 ? 's' : ''}` : ''}</span>
              </p>
            )}
          </div>
          <NotificationBell />
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {sections.map((section, idx) => (
          <div key={section.title} className="admin-sidebar-section">
            <p className="admin-sidebar-section-title animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              {section.title}
            </p>
            {section.items.map((item) =>
              item.action === 'open-chat' ? (
                <button
                  key={item.id}
                  type="button"
                  className="admin-sidebar-item animate-slide-left"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    border: 'none',
                    background: 'transparent',
                    font: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('petfood:open-chat'));
                    onNavigate?.();
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <NavLink
                  key={item.id}
                  to={`/${item.id}`}
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) =>
                    `admin-sidebar-item ${isActive ? 'active' : ''} animate-slide-left`
                  }
                  style={({ isActive }) => ({
                    textDecoration: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  })}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            )}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <ThemeToggles />
        <button
          type="button"
          onClick={onLogout}
          className="btn btn-danger"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
