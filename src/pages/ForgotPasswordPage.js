import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { validateEmail } from '../utils/loginValidation';
import { mapAuthError } from '../utils/authErrors';
import { authPageStyles as s, authInputStyle } from '../utils/authPageStyles';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    const trimmed = email.trim().toLowerCase();
    const emailErr = validateEmail(trimmed);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }
    setFieldError('');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: trimmed });
      setSuccess(data);
    } catch (err) {
      setError(
        mapAuthError(
          err.response?.data?.error,
          'Impossible d\'envoyer le lien. Réessayez dans quelques minutes.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const devResetLink = success?.resetToken
    ? `/reset-password?token=${encodeURIComponent(success.resetToken)}`
    : null;

  return (
    <div style={s.container}>
      <div style={s.overlay} />
      <div
        style={{
          ...s.card,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease',
        }}
      >
        <h1 style={s.title}>🔑 Mot de passe oublié</h1>
        <p style={s.subtitle}>
          Saisissez votre email. Nous vous enverrons un lien pour réinitialiser votre mot de passe
          (valide 15 minutes).
        </p>

        {error && <div style={s.errorBox} role="alert">⚠ {error}</div>}

        {success ? (
          <>
            <div style={s.successBox} role="status">
              ✅ {success.message}
            </div>
            {success.devNote && devResetLink && (
              <div style={s.infoBox}>
                <strong>{success.devNote}</strong>
                <br />
                <Link to={devResetLink} style={s.link}>
                  Réinitialiser mon mot de passe →
                </Link>
              </div>
            )}
            <button
              type="button"
              style={{ ...s.submitBtn, marginTop: '16px' }}
              onClick={() => navigate('/login')}
            >
              Retour à la connexion
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="forgot-email" style={s.label}>
              Adresse email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError('');
                if (error) setError('');
              }}
              style={authInputStyle(!!fieldError)}
              placeholder="nom@domaine.tn"
              aria-invalid={!!fieldError}
            />
            {fieldError && <p style={s.fieldError}>⚠ {fieldError}</p>}

            <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? <span style={s.spinner} /> : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <p style={s.linkRow}>
          <Link to="/login" style={s.link}>← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
