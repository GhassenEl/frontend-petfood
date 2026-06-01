import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { validatePassword, validateResetPasswordForm, getPasswordStrength } from '../utils/loginValidation';
import { mapAuthError } from '../utils/authErrors';
import { authPageStyles as s, authInputStyle, authPasswordInputStyle } from '../utils/authPageStyles';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fromUrl = searchParams.get('token');
    if (fromUrl) setToken(fromUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setError('Collez le lien ou le code reçu par email.');
      return;
    }

    const { valid, errors } = validateResetPasswordForm({ password, confirmPassword });
    setFieldErrors(errors);
    if (!valid) return;

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: trimmedToken, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(
        mapAuthError(
          err.response?.data?.error,
          'Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

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
        <h1 style={s.title}>🔒 Nouveau mot de passe</h1>
        <p style={s.subtitle}>
          Choisissez un mot de passe sécurisé (minimum 6 caractères, sans espaces).
        </p>

        {error && <div style={s.errorBox} role="alert">⚠ {error}</div>}
        {success && (
          <div style={s.successBox} role="status">
            ✅ Mot de passe mis à jour ! Redirection vers la connexion…
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} noValidate>
            {!searchParams.get('token') && (
              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="reset-token" style={s.label}>
                  Code de réinitialisation
                </label>
                <input
                  id="reset-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={authInputStyle(false)}
                  placeholder="Collez le token du lien reçu"
                  autoComplete="off"
                />
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label htmlFor="reset-password" style={s.label}>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: validatePassword(e.target.value),
                      }));
                    }
                  }}
                  style={authPasswordInputStyle(!!fieldErrors.password)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '8px' }} aria-hidden="true">
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '4px',
                          borderRadius: '2px',
                          background: i < strength.score ? strength.color : '#e5e7eb',
                          transition: 'background 0.2s',
                        }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <span style={{ fontSize: '11px', color: strength.color }}>{strength.label}</span>
                  )}
                </div>
              )}
              {fieldErrors.password && <p style={s.fieldError}>⚠ {fieldErrors.password}</p>}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label htmlFor="reset-confirm" style={s.label}>
                Confirmer le mot de passe
              </label>
              <input
                id="reset-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={authPasswordInputStyle(!!fieldErrors.confirmPassword)}
                placeholder="••••••••"
              />
              {fieldErrors.confirmPassword && (
                <p style={s.fieldError}>⚠ {fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? <span style={s.spinner} /> : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}

        <p style={s.linkRow}>
          <Link to="/forgot-password" style={s.link}>Demander un nouveau lien</Link>
          {' · '}
          <Link to="/login" style={s.link}>Connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
