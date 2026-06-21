import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
import { LOGIN_BACKGROUND } from '../utils/platformImages';
import './LoginPage.css';

const LoginPage = () => {
  const { login, logout } = useAuth();
  const formRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe] = useState(() => isRememberMeEnabled());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutDone, setSignOutDone] = useState(false);
  const [loginGuard, setLoginGuard] = useState(() => getLoginAttemptState());

  useEffect(() => {
    setMounted(true);
    const savedEmail = getRememberedEmail();
    if (savedEmail) setEmail(savedEmail);
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

  const formInvalid = !!fieldErrors.email || !!fieldErrors.password;

  return (
    <div
      className="login-page-root"
      style={{ backgroundImage: `url('${LOGIN_BACKGROUND}')` }}
    >
      <div className="login-page-overlay" />

      <div
        ref={formRef}
        className={`login-page-card ${mounted ? 'login-page-card--mounted' : 'login-page-card--enter'}`}
      >
        <div className="login-page-logo-section">
          <div className="login-page-logo-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <h1 className="login-page-title">PetfoodTN</h1>
          <p className="login-page-subtitle">Bienvenue sur votre espace</p>
        </div>

        {signOutDone && !error && (
          <div className="login-page-error login-page-error--success" role="status">
            <span>✓</span> Session fermée — vous pouvez vous reconnecter.
          </div>
        )}

        {loginGuard.requiresCaptcha && !loginGuard.locked && (
          <div className="login-page-error login-page-error--warn" role="status">
            <span>🛡️</span> Plusieurs tentatives échouées — connexion surveillée.
          </div>
        )}

        {error && (
          <div className="login-page-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form className="login-page-form" onSubmit={handleSubmit} noValidate>
          <div className="login-page-input-group">
            <label htmlFor="login-email" className="login-page-label">
              Adresse email
            </label>
            <div className="login-page-input-wrap">
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
                className={`login-page-input login-page-input--email${touched.email && fieldErrors.email ? ' login-page-input--error' : ''}`}
                placeholder="nom@domaine.tn"
                aria-invalid={touched.email && !!fieldErrors.email}
              />
              <span className="login-page-input-icon">✉</span>
            </div>
            {touched.email && fieldErrors.email && (
              <p className="login-page-field-error" role="alert">⚠ {fieldErrors.email}</p>
            )}
          </div>

          <div className="login-page-input-group">
            <label htmlFor="login-password" className="login-page-label">
              Mot de passe
            </label>
            <div className="login-page-input-wrap">
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
                className={`login-page-input${touched.password && fieldErrors.password ? ' login-page-input--error' : ''}`}
                placeholder="••••••••"
                aria-invalid={touched.password && !!fieldErrors.password}
              />
              <button
                type="button"
                className="login-page-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <p className="login-page-field-error" role="alert">⚠ {fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="login-page-submit"
            disabled={loading || (touched.email && touched.password && formInvalid)}
          >
            {loading ? <span className="login-page-spinner" /> : 'Se connecter →'}
          </button>

          <div className="login-page-auth-actions">
            <button type="button" className="login-page-sign-in-btn" onClick={handleSignInFocus}>
              Sign in
            </button>
            <button
              type="button"
              className="login-page-sign-out-btn"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Sign out…' : 'Sign out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
