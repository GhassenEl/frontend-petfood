import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      // Navigation is handled by App.js based on user role - no manual navigation needed
      // The AuthContext updates the user state, and App.js will automatically render the correct layout
    } else {
      setError(result.error === 'Invalid credentials' ? 'Identifiants incorrects' : (result.error || 'Erreur de connexion'));
    }
    setLoading(false);
  };

  // Auto-fill demo credentials when clicking demo cards
  const fillDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const styles = {
  container: {
          minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundImage: `url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
  },
        overlay: {

          position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 100%)',
        zIndex: 0,
  },
        paw1: {position: 'absolute', fontSize: '3rem', opacity: 0.15, top: '10%', left: '8%', animation: 'float 6s ease-in-out infinite', zIndex: 1 },
        paw2: {position: 'absolute', fontSize: '2.2rem', opacity: 0.12, top: '70%', left: '15%', animation: 'float2 8s ease-in-out infinite', zIndex: 1 },
        paw3: {position: 'absolute', fontSize: '2.8rem', opacity: 0.14, top: '20%', right: '12%', animation: 'float3 7s ease-in-out infinite', zIndex: 1 },
        paw4: {position: 'absolute', fontSize: '2rem', opacity: 0.1, bottom: '15%', right: '20%', animation: 'float 9s ease-in-out infinite', zIndex: 1 },
        paw5: {position: 'absolute', fontSize: '3.5rem', opacity: 0.08, top: '45%', left: '5%', animation: 'float2 10s ease-in-out infinite', zIndex: 1 },
        card: {
          background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.5) inset',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 1,
  },
        logoSection: {
          textAlign: 'center',
        marginBottom: '28px',
  },
        logoCircle: {
          width: '44px',
        height: '44px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3), 0 0 0 4px rgba(16, 185, 129, 0.1)',
        transition: 'transform 0.3s ease',
  },
        title: {
          fontSize: '22px',
        fontWeight: '800',
        color: '#065f46',
        margin: '0 0 4px 0',
        letterSpacing: '-0.5px',
  },
        subtitle: {
          fontSize: '13px',
        color: '#6b7280',
        margin: 0,
  },
        errorBox: {
          background: 'rgba(254, 226, 226, 0.9)',
        border: '1px solid rgba(252, 165, 165, 0.5)',
        color: '#b91c1c',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
  },
        errorIcon: {
          fontSize: '16px',
  },
        form: {
          display: 'flex',
        flexDirection: 'column',
        gap: '14px',
  },
        inputGroup: {
          position: 'relative',
  },
        input: {
          width: '100%',
        padding: '14px 42px 14px 16px',
        borderRadius: '14px',
        border: '2px solid #e5e7eb',
        background: 'rgba(255, 255, 255, 0.9)',
        fontSize: '14px',
        color: '#1f2937',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
  },
        inputIcon: {
          position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '14px',
        color: '#9ca3af',
        pointerEvents: 'none',
  },
        eyeBtn: {
          position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px',
  },
        submitBtn: {
          width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        border: 'none',
        borderRadius: '14px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '4px',
  },
        spinner: {
          width: '18px',
        height: '18px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
  },
        demoSection: {
          marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
  },
        demoTitle: {
          fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '600',
  },
        demoGrid: {
          display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
  },
        demoCard: {
          background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '14px',
        padding: '14px 12px',
        border: '1px solid rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        cursor: 'default',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
        demoRole: {
          fontSize: '12px',
        fontWeight: '700',
        color: '#10b981',
        margin: '0 0 6px 0',
  },
        demoCred: {
          fontSize: '11px',
        color: '#6b7280',
        margin: '2px 0',
        fontFamily: 'monospace',
  },
};

  return (
  <div style={styles.container}>


      {/* Dark overlay for readability */}
      <div style={styles.overlay}></div>

      {/* Animated paw prints */}
      <div style={styles.paw1}>🐾</div>
      <div style={styles.paw2}>🐾</div>
      <div style={styles.paw3}>🐾</div>
      <div style={styles.paw4}>🐾</div>
      <div style={styles.paw5}>🐾</div>

        <div
          style={{
            ...styles.card,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          }}
        >


        <div style={styles.logoSection}>

          <div style={styles.logoCircle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h1 style={styles.title}>PetfoodTN</h1>
          <p style={styles.subtitle}>Bienvenue sur votre espace</p>
        </div>


        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Adresse email"
            />
            <span style={styles.inputIcon}>✉</span>
          </div>

          <div style={styles.inputGroup}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Mot de passe"
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.transform = 'scale(1)';
            }}
          >
            {loading ? (
              <span style={styles.spinner}></span>
            ) : (
              'Se connecter →'
            )}
          </button>
        </form>

<div style={styles.demoSection}>
          <p style={styles.demoTitle}>Comptes de démonstration (cliquez pour remplir)</p>
          <div style={styles.demoGrid}>
            <div
              style={styles.demoCard}
              onClick={() => fillDemoCredentials('admin@petfood.tn', 'PetfoodTN2024!')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.2)';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.cursor = 'pointer';
              }}
            >
              <p style={styles.demoRole}>👤 Admin</p>
              <p style={styles.demoCred}>admin@petfood.tn</p>
              <p style={styles.demoCred}>PetfoodTN2024!</p>
            </div>
            <div
              style={styles.demoCard}
              onClick={() => fillDemoCredentials('client@petfood.tn', 'MonChat123!')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.cursor = 'pointer';
              }}
            >
              <p style={{...styles.demoRole, color: '#3b82f6'}}>👤 Client</p>
              <p style={styles.demoCred}>client@petfood.tn</p>
              <p style={styles.demoCred}>MonChat123!</p>
            </div>
            <div
              style={styles.demoCard}
              onClick={() => fillDemoCredentials('livreur@petfood.tn', 'Livreur123!')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.2)';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.cursor = 'pointer';
              }}
            >
              <p style={{...styles.demoRole, color: '#f59e0b'}}>🚚 Livreur</p>
              <p style={styles.demoCred}>livreur@petfood.tn</p>
              <p style={styles.demoCred}>Livreur123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;