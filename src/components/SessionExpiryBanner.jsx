import React, { useCallback, useEffect, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { AUTH_EVENTS } from '../utils/jwtSecurity';
import { getStoredToken, persistAuthToken, isRememberMeEnabled } from '../utils/authStorage';
import { validateTokenClaims } from '../utils/jwtSecurity';
import './SessionExpiryBanner.css';

const SessionExpiryBanner = () => {
  const [visible, setVisible] = useState(false);
  const [expiresInMs, setExpiresInMs] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const onExpiring = (event) => {
      setExpiresInMs(event.detail?.expiresInMs ?? 0);
      setVisible(true);
    };

    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRING, onExpiring);
    return () => window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRING, onExpiring);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = getStoredToken();
      const { data } = await api.post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` },
        _skipAuthRefresh: true,
      });
      const newToken = data?.token;
      const validation = validateTokenClaims(newToken);
      if (validation.valid) {
        persistAuthToken(newToken, isRememberMeEnabled());
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, { detail: { token: newToken } }));
        setVisible(false);
      }
    } catch {
      /* session watchdog gérera la déconnexion */
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (!visible) return null;

  const mins = Math.max(1, Math.ceil(expiresInMs / 60000));

  return (
    <div className="session-expiry-banner" role="alert">
      <Clock size={18} aria-hidden />
      <span>
        Votre session expire dans environ {mins} min.
      </span>
      <button type="button" onClick={handleRefresh} disabled={refreshing}>
        <RefreshCw size={14} aria-hidden />
        {refreshing ? 'Renouvellement…' : 'Prolonger la session'}
      </button>
      <button type="button" className="session-expiry-dismiss" onClick={() => setVisible(false)} aria-label="Fermer">
        ×
      </button>
    </div>
  );
};

export default SessionExpiryBanner;
