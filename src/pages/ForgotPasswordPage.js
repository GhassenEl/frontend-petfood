import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { validateEmail } from '../utils/loginValidation';
import { mapAuthError } from '../utils/authErrors';
import { LOGIN_BACKGROUND } from '../utils/platformImages';
import AuthLegalFooter from '../components/AuthLegalFooter';
import './LoginPage.css';

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
          'Impossible d\'envoyer le lien. Réessayez dans quelques minutes.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const devResetLink = success?.resetToken
    ? `/reset-password?token=${encodeURIComponent(success.resetToken)}`
    : null;

  return (
    <div
      className="login-page-root"
      style={{ backgroundImage: `url('${LOGIN_BACKGROUND}')` }}
    >
      <div className="login-page-overlay" />

      <div
        className={`login-page-card ${mounted ? 'login-page-card--mounted' : 'login-page-card--enter'}`}
      >
        <div className="login-page-logo-section">
          <div className="login-page-logo-circle">
            <span style={{ fontSize: 20 }} aria-hidden>🔑</span>
          </div>
          <h1 className="login-page-title">Mot de passe oublié</h1>
          <p className="login-page-subtitle">
            Saisissez votre e-mail — nous vous enverrons un lien valide 15 minutes.
          </p>
        </div>

        {error && (
          <div className="login-page-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {success ? (
          <>
            <div className="login-page-error login-page-error--success" role="status">
              <span>✓</span> {success.message}
              {success.emailSent && (
                <span style={{ display: 'block', marginTop: 6, fontSize: 12, fontWeight: 600 }}>
                  E-mail envoyé à {email.trim().toLowerCase()}
                </span>
              )}
            </div>
            {success.devNote && devResetLink && (
              <div className="login-page-dev-note">
                <strong>{success.devNote}</strong>
                <Link to={devResetLink} className="login-page-forgot-link">
                  Réinitialiser mon mot de passe →
                </Link>
              </div>
            )}
            <button
              type="button"
              className="login-page-submit"
              onClick={() => navigate('/login')}
            >
              Retour à la connexion
            </button>
          </>
        ) : (
          <form className="login-page-form" onSubmit={handleSubmit} noValidate>
            <div className="login-page-input-group">
              <label htmlFor="forgot-email" className="login-page-label">
                Adresse email
              </label>
              <div className="login-page-input-wrap">
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
                  className={`login-page-input login-page-input--email${fieldError ? ' login-page-input--error' : ''}`}
                  placeholder="nom@domaine.tn"
                  aria-invalid={!!fieldError}
                />
                <span className="login-page-input-icon">✉</span>
              </div>
              {fieldError && (
                <p className="login-page-field-error" role="alert">⚠ {fieldError}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="login-page-submit">
              {loading ? <span className="login-page-spinner" /> : 'Envoyer le lien →'}
            </button>
          </form>
        )}

        <p className="login-page-back-link">
          <Link to="/login">← Retour à la connexion</Link>
        </p>

        <AuthLegalFooter />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
