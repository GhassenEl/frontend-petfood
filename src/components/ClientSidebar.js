import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import NotificationBell from './NotificationBell';
import ThemeToggles from './ThemeToggles';
import ConfigSidebarNav from './platform/ConfigSidebarNav';
import { CLIENT_SIDEBAR_SECTIONS } from '../config/clientSidebarConfig';
import PetfoodLogo from './PetfoodLogo';

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

  const petEmoji = petEmojis[profile.petType] || '🐾';
  const petLabel = petLabels[profile.petType] || null;

  return (
    <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }} aria-label="Navigation client">
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <PetfoodLogo size="sm" showTagline subtitle="Espace client" />
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
        <ConfigSidebarNav
          sections={CLIENT_SIDEBAR_SECTIONS}
          routePrefix="/"
          onNavigate={onNavigate}
          itemClassName="admin-sidebar-item animate-slide-left"
          sectionTitleClassName="admin-sidebar-section-title animate-fade-in"
        />
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
