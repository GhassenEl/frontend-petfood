import React, { useState } from 'react';
import { subscribeNewsletter } from '../services/digitalMarketingService';

const MarketingNewsletterForm = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMsg('');
    try {
      await subscribeNewsletter({ email });
      setOk(true);
      setMsg('Merci ! Vous recevrez nos offres et conseils nutrition.');
      setEmail('');
    } catch (err) {
      setOk(false);
      setMsg(err.message || 'Inscription impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <form className="mkt-newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email newsletter"
        />
        <button type="submit" disabled={busy}>
          {busy ? '…' : "S'inscrire"}
        </button>
      </form>
      {msg && (
        <p className={`mkt-newsletter-msg ${ok ? 'mkt-newsletter-msg--ok' : 'mkt-newsletter-msg--err'}`}>
          {msg}
        </p>
      )}
    </div>
  );
};

export default MarketingNewsletterForm;
