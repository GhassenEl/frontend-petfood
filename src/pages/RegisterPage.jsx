import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getRememberedEmail,
  isRememberMeEnabled,
  persistRememberedEmail,
} from '../utils/authStorage';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateRegisterForm,
} from '../utils/loginValidation';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedEmail = getRememberedEmail();
    if (savedEmail) setEmail(savedEmail);
    setRememberMe(isRememberMeEnabled());
  }, []);

  const runFieldValidation = useCallback((field, values) => {
    let msg = '';
    if (field === 'name') msg = validateName(values.name);
    else if (field === 'email') msg = validateEmail(values.email);
    else msg = validatePassword(values.password);
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));
    return !msg;
  }, []);

  const currentValues = () => ({ name, email, password });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    runFieldValidation(field, currentValues());
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) runFieldValidation('name', { ...currentValues(), name: value });
    if (error) setError('');
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) runFieldValidation('email', { ...currentValues(), email: value });
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) runFieldValidation('password', { ...currentValues(), password: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, email: true, password: true });

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const { valid, errors } = validateRegisterForm({
      name: trimmedName,
      email: trimmedEmail,
      password,
    });
    setFieldErrors(errors);

    if (!valid) {
      setError('Corrigez les champs signalés avant de continuer.');
      return;
    }

    setLoading(true);
    const result = await register({ name: trimmedName, email: trimmedEmail, password }, rememberMe);
    setLoading(false);

    if (result.success) {
      persistRememberedEmail(trimmedEmail, rememberMe);
      navigate('/client-products');
    } else {
      setError(result.error || 'Erreur lors de l\'inscription');
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 42px 14px 16px',
    borderRadius: '14px',
    border: `2px solid ${touched[field] && fieldErrors[field] ? '#f87171' : '#d1d5db'}`,
    outline: 'none',
    fontSize: '15px',
    color: '#0f172a',
    background: 'white',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  });

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundImage: `url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
      zIndex: 0,
    },
    card: {
      background: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderRadius: '32px',
      padding: '40px 36px',
      width: '100%',
      maxWidth: '480px',
      boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)',
      position: 'relative',
      zIndex: 1,
      transition: 'all 0.5s ease',
    },
    title: { fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' },
    subtitle: { color: '#475569', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 },
    form: { display: 'grid', gap: '16px' },
    fieldGroup: { display: 'grid', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
    inputWrap: { position: 'relative' },
    fieldError: { color: '#dc2626', fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' },
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
    errorBox: {
      background: '#fee2e2',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '12px 14px',
      borderRadius: '14px',
      fontSize: '13px',
      marginBottom: '4px',
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
    cookieHint: { fontSize: '11px', color: '#9ca3af', lineHeight: 1.4, margin: 0 },
    submitBtn: {
      width: '100%',
      padding: '14px 18px',
      borderRadius: '16px',
      border: 'none',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'opacity 0.2s ease',
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
    helperText: { textAlign: 'center', color: '#475569', fontSize: '14px', marginTop: '18px' },
    registerLink: { color: '#059669', fontWeight: 700, textDecoration: 'none' },
  };

  const formInvalid = !!fieldErrors.name || !!fieldErrors.email || !!fieldErrors.password;

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />
      <div
        style={{
          ...styles.card,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <h1 style={styles.title}>Créer un compte</h1>
        <p style={styles.subtitle}>
          Inscrivez-vous pour acheter des produits et suivre l'historique de vos commandes.
        </p>

        {error && (
          <div style={styles.errorBox} role="alert">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label htmlFor="register-name" style={styles.label}>
              Nom complet
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              value={name}
              onChange={handleNameChange}
              onBlur={() => handleBlur('name')}
              style={inputStyle('name')}
              placeholder="Prénom Nom"
              aria-invalid={touched.name && !!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
            />
            {touched.name && fieldErrors.name && (
              <p id="register-name-error" style={styles.fieldError} role="alert">
                ⚠ {fieldErrors.name}
              </p>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="register-email" style={styles.label}>
              Adresse email
            </label>
            <input
              id="register-email"
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
              aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
            />
            {touched.email && fieldErrors.email && (
              <p id="register-email-error" style={styles.fieldError} role="alert">
                ⚠ {fieldErrors.email}
              </p>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="register-password" style={styles.label}>
              Mot de passe
            </label>
            <div style={styles.inputWrap}>
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                style={inputStyle('password')}
                placeholder="••••••••"
                aria-invalid={touched.password && !!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
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
              <p id="register-password-error" style={styles.fieldError} role="alert">
                ⚠ {fieldErrors.password}
              </p>
            )}
          </div>

          <label style={styles.rememberLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Se souvenir de moi
          </label>
          {rememberMe && (
            <p style={styles.cookieHint}>
              Un cookie sécurisé (30 jours) mémorise votre email et votre session sur cet appareil.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (touched.name && touched.email && touched.password && formInvalid)}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <span style={styles.spinner} /> : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.helperText}>
          Déjà inscrit ? <Link to="/login" style={styles.registerLink}>Se connecter</Link>
        </p>
        <p style={{ ...styles.helperText, marginTop: 12 }}>
          <Link to="/" style={{ ...styles.registerLink, color: '#059669' }}>← Voir la présentation PetfoodTN</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
