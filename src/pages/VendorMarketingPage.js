import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Share2, Bell, Handshake, RefreshCw, ExternalLink, CreditCard } from 'lucide-react';
import MarketingPrintStudio from '../components/MarketingPrintStudio';
import { VENDOR_PRINT_DEFAULTS } from '../config/marketingPrintCatalog';
import '../pages/AdminDigitalMarketing.css';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { DEMO_ADMIN_REGIONS } from '../utils/adminDemoData';
import {
  fetchVendorMarketingPack,
  saveVendorSocialLinks,
  fetchVendorMarketingNotifications,
  markVendorNotificationRead,
  submitVendorPartnerApplication,
  getStoredPartnerApplication,
} from '../services/vendorMarketingService';
import './VendorPages.css';

const TABS = [
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'social', label: 'Réseaux sociaux', icon: Share2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'partner', label: 'Candidature partenaire', icon: Handshake },
  { id: 'print', label: 'Cartes & print', icon: CreditCard },
];

const statusLabel = {
  active: { text: 'Active', bg: '#d1fae5', color: '#047857' },
  scheduled: { text: 'Planifiée', bg: '#dbeafe', color: '#1d4ed8' },
  completed: { text: 'Terminée', bg: '#f1f5f9', color: '#475569' },
  pending: { text: 'En attente', bg: '#fef3c7', color: '#b45309' },
  approved: { text: 'Approuvée', bg: '#d1fae5', color: '#047857' },
};

const VendorMarketingPage = () => {
  const [tab, setTab] = useState('marketing');
  const [pack, setPack] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [partnerApp, setPartnerApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socialSaved, setSocialSaved] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    region: DEMO_ADMIN_REGIONS[0],
    siret: '',
    address: '',
    category: 'Animalerie',
  });
  const [partnerStatus, setPartnerStatus] = useState({ type: '', text: '' });
  const [partnerSending, setPartnerSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [marketing, notifs] = await Promise.all([
        fetchVendorMarketingPack(),
        fetchVendorMarketingNotifications(),
      ]);
      setPack(marketing);
      setSocialLinks(marketing.socialLinks || []);
      setNotifications(notifs);
      setPartnerApp(getStoredPartnerApplication());
    } catch {
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  const handleSocialChange = (id, field, value) => {
    setSocialLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    setSocialSaved(false);
  };

  const saveSocial = () => {
    saveVendorSocialLinks(socialLinks);
    setSocialSaved(true);
    setTimeout(() => setSocialSaved(false), 2500);
  };

  const markRead = async (id) => {
    await markVendorNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const submitPartner = async (e) => {
    e.preventDefault();
    setPartnerSending(true);
    setPartnerStatus({ type: '', text: '' });
    try {
      const record = await submitVendorPartnerApplication(partnerForm);
      setPartnerApp(record);
      setPartnerStatus({
        type: 'success',
        text: `Candidature envoyée — référence ${record.reference}. Réponse sous 48 h.`,
      });
      setPartnerForm({
        shopName: '',
        ownerName: '',
        email: '',
        phone: '',
        region: DEMO_ADMIN_REGIONS[0],
        siret: '',
        address: '',
        category: 'Animalerie',
      });
    } catch (err) {
      setPartnerStatus({
        type: 'error',
        text: err?.response?.data?.message || 'Envoi impossible — réessayez ou écrivez à partenaires@petfoodtn.tn',
      });
    } finally {
      setPartnerSending(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const partnerMeta = statusLabel[partnerApp?.status] || statusLabel.pending;

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><Megaphone size={24} /> Marketing &amp; communication</h1>
        <p>
          Campagnes boutique, liens réseaux sociaux, notifications et candidature partenaire PetfoodTN.
          {pack?.source === 'demo' && <span className="vnd-demo-pill">Mode démo</span>}
        </p>
      </header>

      <div className="vnd-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`vnd-tab${tab === id ? ' vnd-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {label}
            {id === 'notifications' && unreadCount > 0 && (
              <span className="vnd-tab-badge">{unreadCount}</span>
            )}
          </button>
        ))}
        <button type="button" className="vnd-tab vnd-tab--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {loading && !pack && tab !== 'print' ? (
        <p style={{ color: '#64748b' }}>Chargement…</p>
      ) : (
        <>
          {tab === 'print' && (
            <MarketingPrintStudio
              defaults={{
                ...VENDOR_PRINT_DEFAULTS,
                brandName: partnerForm.shopName || VENDOR_PRINT_DEFAULTS.brandName,
                personName: partnerForm.ownerName || VENDOR_PRINT_DEFAULTS.personName,
                phone: partnerForm.phone || VENDOR_PRINT_DEFAULTS.phone,
                email: partnerForm.email || VENDOR_PRINT_DEFAULTS.email,
                address: partnerForm.address || VENDOR_PRINT_DEFAULTS.address,
              }}
              title="Cartes de visite boutique"
              storageKey="petfoodtn_vendor_print_profile_v1"
            />
          )}

          {tab === 'marketing' && pack && (
            <div className="vnd-marketing-grid">
              <section className="vnd-card">
                <h2>Campagnes en cours</h2>
                <div className="vnd-table-wrap">
                  <table className="vnd-table">
                    <thead>
                      <tr>
                        <th>Campagne</th>
                        <th>Canal</th>
                        <th>Statut</th>
                        <th>Portée</th>
                        <th>Clics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pack?.campaigns || []).map((c) => {
                        const st = statusLabel[c.status] || statusLabel.active;
                        return (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.channel}</td>
                            <td>
                              <span className="vnd-pill" style={{ background: st.bg, color: st.color }}>{st.text}</span>
                            </td>
                            <td>{c.reach?.toLocaleString('fr-FR')}</td>
                            <td>{c.clicks?.toLocaleString('fr-FR')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
                  Hub admin : <Link to="/admin/digital-marketing">Marketing digital plateforme →</Link>
                </p>
              </section>

              <section className="vnd-card">
                <h2>Conseils communication</h2>
                <ul className="vnd-tips-list">
                  {(pack?.communicationTips || []).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
                <Link to="/vendor/communication" className="vnd-link-btn">
                  Ouvrir avis &amp; messagerie →
                </Link>
              </section>
            </div>
          )}

          {tab === 'social' && (
            <section className="vnd-card">
              <h2>Liens réseaux sociaux — vitrine boutique</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>
                Ces liens apparaissent sur votre fiche vendeur et vos communications clients.
              </p>
              <div className="vnd-social-grid">
                {socialLinks.map((link) => (
                  <div key={link.id} className="vnd-social-card">
                    <div className="vnd-social-card__head">
                      <span className="vnd-social-emoji" style={{ background: link.color }}>{link.emoji}</span>
                      <strong>{link.name}</strong>
                      <label className="vnd-social-toggle">
                        <input
                          type="checkbox"
                          checked={!!link.enabled}
                          onChange={(e) => handleSocialChange(link.id, 'enabled', e.target.checked)}
                        />
                        Actif
                      </label>
                    </div>
                    <input
                      type="url"
                      className="vnd-input"
                      value={link.url}
                      onChange={(e) => handleSocialChange(link.id, 'url', e.target.value)}
                      placeholder="https://…"
                    />
                    {link.enabled && link.url && (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="vnd-social-preview">
                        <ExternalLink size={14} /> Aperçu
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="vnd-btn-primary" onClick={saveSocial}>
                {socialSaved ? '✓ Enregistré' : 'Enregistrer les liens'}
              </button>
            </section>
          )}

          {tab === 'notifications' && (
            <section className="vnd-card">
              <h2>Notifications vendeur</h2>
              {notifications.length === 0 ? (
                <p style={{ color: '#64748b' }}>Aucune notification.</p>
              ) : (
                <ul className="vnd-notif-list">
                  {notifications.map((n) => (
                    <li key={n.id} className={`vnd-notif-item${n.read ? ' vnd-notif-item--read' : ''}`}>
                      <div>
                        <span className="vnd-notif-type">{n.type === 'order' ? '📦' : n.type === 'review' ? '⭐' : '↩️'}</span>
                        <span>{n.text}</span>
                        <small>{new Date(n.at).toLocaleString('fr-FR')}</small>
                      </div>
                      {!n.read && (
                        <button type="button" className="vnd-btn-ghost" onClick={() => markRead(n.id)}>
                          Marquer lu
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/vendor/communication" className="vnd-link-btn" style={{ marginTop: 16 }}>
                Toute la communication →
              </Link>
            </section>
          )}

          {tab === 'partner' && (
            <div className="vnd-partner-block">
              {partnerApp && (
                <section className="vnd-card vnd-partner-status">
                  <h2>Statut candidature</h2>
                  <p>
                    <span className="vnd-pill" style={{ background: partnerMeta.bg, color: partnerMeta.color }}>
                      {partnerMeta.text}
                    </span>
                    {' '}
                    {partnerApp.shopName && <>— <strong>{partnerApp.shopName}</strong></>}
                  </p>
                  {partnerApp.reference && <p style={{ fontSize: 13, color: '#64748b' }}>Réf. {partnerApp.reference}</p>}
                  {partnerApp.submittedAt && (
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>
                      Soumise le {new Date(partnerApp.submittedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </section>
              )}

              <section className="vnd-card">
                <h2>Nouvelle candidature partenaire</h2>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>
                  Animalerie, fabricant ou distributeur — validation par l&apos;équipe PetfoodTN sous 48 h.
                </p>
                <form className="vnd-partner-form" onSubmit={submitPartner}>
                  <div className="vnd-partner-form__grid">
                    <label>
                      Nom de la boutique
                      <input required value={partnerForm.shopName} onChange={(e) => setPartnerForm((f) => ({ ...f, shopName: e.target.value }))} />
                    </label>
                    <label>
                      Responsable
                      <input required value={partnerForm.ownerName} onChange={(e) => setPartnerForm((f) => ({ ...f, ownerName: e.target.value }))} />
                    </label>
                    <label>
                      Email pro
                      <input required type="email" value={partnerForm.email} onChange={(e) => setPartnerForm((f) => ({ ...f, email: e.target.value }))} />
                    </label>
                    <label>
                      Téléphone
                      <input required value={partnerForm.phone} onChange={(e) => setPartnerForm((f) => ({ ...f, phone: e.target.value }))} />
                    </label>
                    <label>
                      Région
                      <select value={partnerForm.region} onChange={(e) => setPartnerForm((f) => ({ ...f, region: e.target.value }))}>
                        {DEMO_ADMIN_REGIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Matricule fiscal / SIRET
                      <input value={partnerForm.siret} onChange={(e) => setPartnerForm((f) => ({ ...f, siret: e.target.value }))} />
                    </label>
                    <label className="vnd-partner-form__full">
                      Adresse
                      <input required value={partnerForm.address} onChange={(e) => setPartnerForm((f) => ({ ...f, address: e.target.value }))} />
                    </label>
                  </div>
                  {partnerStatus.text && (
                    <p className={`vnd-partner-form__status vnd-partner-form__status--${partnerStatus.type}`}>
                      {partnerStatus.text}
                    </p>
                  )}
                  <button type="submit" className="vnd-btn-primary" disabled={partnerSending}>
                    {partnerSending ? 'Envoi…' : 'Envoyer ma candidature'}
                  </button>
                </form>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
                  Ou écrivez à <a href="mailto:partenaires@petfoodtn.tn">partenaires@petfoodtn.tn</a>
                  {' · '}
                  <Link to="/vendor">Hub vendeur public</Link>
                </p>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorMarketingPage;
