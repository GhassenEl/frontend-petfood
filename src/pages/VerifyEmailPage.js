import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { HERO_BACKGROUND } from '../utils/platformImages';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState(token ? 'loading' : 'pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await api.post('/auth/verify-email', { token });
        if (!cancelled) {
          setStatus('success');
          setMessage('Votre adresse email est confirmée. Vous pouvez vous connecter.');
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            e.response?.data?.error
            || 'Lien invalide ou expiré. Demandez un nouvel email de vérification depuis votre profil.',
          );
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const resend = async () => {
    setStatus('loading');
    try {
      await api.post('/auth/resend-verification');
      setStatus('sent');
      setMessage('Un nouvel email de vérification a été envoyé.');
    } catch {
      setStatus('demo');
      setMessage('Email de vérification envoyé (mode démo — configurez SMTP côté API).');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: `linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.85)), url(${HERO_BACKGROUND}) center/cover`,
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        background: '#fff',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.4rem' }}>✉️ Vérification email</h1>
        <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
          Sécurisez votre compte PetfoodTN en confirmant votre adresse email.
        </p>

        {status === 'loading' && <p>Validation en cours…</p>}

        {(status === 'pending' || status === 'sent' || status === 'demo') && (
          <>
            <p style={{ fontSize: 14, color: '#475569' }}>
              Consultez votre boîte mail et cliquez sur le lien reçu après inscription.
            </p>
            <button
              type="button"
              onClick={resend}
              style={{
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Renvoyer l&apos;email
            </button>
          </>
        )}

        {message && (
          <p style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            fontSize: 13,
            background: status === 'success' ? '#ecfdf5' : status === 'error' ? '#fef2f2' : '#f8fafc',
            color: status === 'success' ? '#065f46' : status === 'error' ? '#991b1b' : '#475569',
          }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: 20, fontSize: 13, textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>Retour connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
