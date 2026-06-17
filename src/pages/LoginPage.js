import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  getRememberedEmail,
  isRememberMeEnabled,
  persistRememberedEmail,
} from '../utils/authStorage';
import {
  validateEmail,
  validatePassword,
  validateLoginForm,
} from '../utils/loginValidation';
import {
  clearLoginAttempts,
  recordLoginFailure,
  getLoginAttemptState,
  getLoginDelayMs,
  formatLockoutRemaining,
} from '../utils/loginAttemptGuard';
import LoginPetsLogo from '../components/LoginPetsLogo';

const LoginPage = () => {
  const { login, logout } = useAuth();
  const formRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutDone, setSignOutDone] = useState(false);
  const [loginGuard, setLoginGuard] = useState(() => getLoginAttemptState());

  useEffect(() => {
    setMounted(true);
    const savedEmail = getRememberedEmail();
    if (savedEmail) setEmail(savedEmail);
    setRememberMe(isRememberMeEnabled());
  }, []);

  const runFieldValidation = useCallback((field, value) => {
    const msg = field === 'email' ? validateEmail(value) : validatePassword(value);
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));
    return !msg;
  }, []);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    runFieldValidation(field, field === 'email' ? email : password);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) runFieldValidation('email', value);
    if (error) setError('');
    if (signOutDone) setSignOutDone(false);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) runFieldValidation('password', value);
    if (error) setError('');
    if (signOutDone) setSignOutDone(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });

    const trimmedEmail = email.trim().toLowerCase();
    const { valid, errors } = validateLoginForm({ email: trimmedEmail, password });
    setFieldErrors(errors);

    if (!valid) {
      setError('Corrigez les champs signalés avant de continuer.');
      return;
    }

    const guard = getLoginAttemptState();
    setLoginGuard(guard);
    if (guard.locked) {
      setError(`Compte temporairement verrouillé. Réessayez dans ${formatLockoutRemaining(guard.remainingMs)}.`);
      return;
    }

    const delay = getLoginDelayMs();
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    setLoading(true);
    const result = await login(trimmedEmail, password, rememberMe);
    if (result.success) {
      clearLoginAttempts();
      setLoginGuard(getLoginAttemptState());
      persistRememberedEmail(trimmedEmail, rememberMe);
    } else {
      const fail = recordLoginFailure();
      setLoginGuard(getLoginAttemptState());
      const base = result.error || 'Erreur de connexion';
      setError(
        fail.requiresCaptcha
          ? `${base} — ${fail.count} tentative(s) échouée(s). Vérifiez vos identifiants.`
          : base,
      );
    }
    setLoading(false);
  };

  const handleSignInFocus = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('login-email')?.focus();
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setError('');
    setSignOutDone(false);
    try {
      await logout();
      setEmail(getRememberedEmail() || '');
      setPassword('');
      setFieldErrors({ email: '', password: '' });
      setTouched({ email: false, password: false });
      setSignOutDone(true);
    } catch {
      setError('Impossible de se déconnecter. Réessayez.');
    } finally {
      setSigningOut(false);
    }
  };

  const inputStyle = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    const base = {
      width: '100%',
      borderRadius: '14px',
      border: `2px solid ${hasError ? '#f87171' : '#e5e7eb'}`,
      background: 'rgba(255, 255, 255, 0.9)',
      fontSize: '14px',
      color: '#1f2937',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
    };
    if (field === 'email') {
      return { ...base, padding: '14px 16px 14px 42px' };
    }
    return { ...base, padding: '14px 44px 14px 16px' };
  };

  const handlePasswordKeyEvent = (e) => {
    if (e.getModifierState) setCapsLockOn(e.getModifierState('CapsLock'));
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
    paw1: { display: 'none' },
    paw2: { display: 'none' },
    paw3: { display: 'none' },
    paw4: { display: 'none' },
    paw5: { display: 'none' },
    card: {
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '36px 32px 40px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255,255,255,0.5) inset',
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      position: 'relative',
      zIndex: 1,
    },
    logoSection: { textAlign: 'center', marginBottom: '8px' },
    title: { fontSize: '24px', fontWeight: 800, color: '#065f46', margin: '4px 0 4px', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '13px', color: '#6b7280', margin: '0 0 20px' },
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
    fieldError: { color: '#dc2626', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' },
    form: { display: 'flex', flexDirection: 'column', gap: '14px' },
    inputGroup: { position: 'relative' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
    inputWrap: { position: 'relative' },
    inputIcon: {
      position: 'absolute',
      left: '14px',
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
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
    },
    rememberLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#4b5563',
      cursor: 'pointer',
      userSelect: 'none',
    },
    forgotLink: {
      fontSize: '13px',
      color: '#10b981',
      fontWeight: 600,
      textDecoration: 'none',
    },
    cookieHint: { fontSize: '11px', color: '#9ca3af', lineHeight: 1.4, margin: 0 },
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
    registerHint: { textAlign: 'center', color: '#475569', fontSize: '14px', margin: '18px 0 0' },
    registerLink: { color: '#10b981', fontWeight: 700, textDecoration: 'none' },
    signInBtn: {
      padding: '10px 18px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
      flex: 1,
    },
    signOutBtn: {
      padding: '10px 18px',
      borderRadius: '12px',
      border: '2px solid #d1d5db',
      background: '#f9fafb',
      color: '#374151',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      flex: 1,
    },
    authActionsRow: {
      display: 'flex',
      gap: '10px',
      marginTop: '12px',
    },
    capsHint: {
      fontSize: '12px',
      color: '#b45309',
      marginTop: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
  };

  const formInvalid =
    !!fieldErrors.email ||
    !!fieldErrors.password;

  return (
    <div className="login-page-root" style={styles.container}>
      <div style={styles.overlay} />

      <div
        ref={formRef}
        className="login-page-card"
        style={{
          ...styles.card,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <div style={styles.logoSection}>
          <LoginPetsLogo />
          <p style={styles.subtitle}>Bienvenue sur votre espace</p>
        </div>

        {signOutDone && !error && (
          <div style={{ ...styles.errorBox, background: 'rgba(209, 250, 229, 0.9)', borderColor: '#6ee7b7', color: '#065f46' }} role="status">
            <span>✓</span> Session fermée — vous pouvez vous reconnecter.
          </div>
        )}

        {loginGuard.requiresCaptcha && !loginGuard.locked && (
          <div style={{ ...styles.errorBox, background: 'rgba(254, 243, 199, 0.95)', borderColor: '#fcd34d', color: '#92400e' }} role="status">
            <span>🛡️</span> Plusieurs tentatives échouées — connexion surveillée pour protéger votre compte.
          </div>
        )}

        {error && (
          <div style={styles.errorBox} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.inputGroup}>
            <label htmlFor="login-email" style={styles.label}>
              Adresse email
            </label>
            <div style={styles.inputWrap}>
              <input
                id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              style={inputStyle('email')}
              placeholder="nom@domaine.tn"
              aria-invalid={touched.email && !!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            />
            <span style={styles.inputIcon}>✉</span>
            </div>
            {touched.email && fieldErrors.email && (
              <p id="login-email-error" style={styles.fieldError} role="alert">
                ⚠ {fieldErrors.email}
              </p>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="login-password" style={styles.label}>
              Mot de passe
            </label>
            <div style={styles.inputWrap}>
              <input
                id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              minLength={6}
              maxLength={128}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              onKeyDown={handlePasswordKeyEvent}
              onKeyUp={handlePasswordKeyEvent}
              style={inputStyle('password')}
              placeholder="••••••••"
              aria-invalid={touched.password && !!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
            </div>
            {touched.password && fieldErrors.password && (
              <p id="login-password-error" style={styles.fieldError} role="alert">
                ⚠ {fieldErrors.password}
              </p>
            )}
            {capsLockOn && (
              <p style={styles.capsHint} role="status">
                ⇪ Verrouillage majuscules activé
              </p>
            )}
          </div>

          <div style={styles.rememberRow}>
            <label style={styles.rememberLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Se souvenir de moi
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Mot de passe oublié ?
            </Link>
          </div>
          {rememberMe && (
            <p style={styles.cookieHint}>
              Un cookie sécurisé (30 jours) mémorise votre email et votre session sur cet appareil.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (touched.email && touched.password && formInvalid)}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.65 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <span style={styles.spinner} /> : 'Se connecter →'}
          </button>

          <div style={styles.authActionsRow}>
            <button type="button" style={styles.signInBtn} onClick={handleSignInFocus}>
              Sign in
            </button>
            <button
              type="button"
              style={{
                ...styles.signOutBtn,
                opacity: signingOut ? 0.7 : 1,
                cursor: signingOut ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Sign out…' : 'Sign out'}
            </button>
          </div>
        </form>

        <p style={styles.registerHint}>
          Pas de compte ? <Link to="/register" style={styles.registerLink}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
