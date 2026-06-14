import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminRegionalStaffList from '../components/AdminRegionalStaffList';
import './AdminPages.css';

const TABS = [
  { id: 'livreur', label: 'Livreurs', emoji: '🚚' },
  { id: 'vet', label: 'Vétérinaires', emoji: '🩺' },
  { id: 'vendor', label: 'Vendeurs', emoji: '🏬' },
  { id: 'moderator', label: 'Modérateurs', emoji: '🛡️' },
];

const AdminRegionalContactsPage = () => {
  const [tab, setTab] = useState('livreur');
  const active = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1>📍 Contacts plateforme par région</h1>
        <p>
          Livreurs, vétérinaires, vendeurs et modérateurs — filtrez par région et envoyez un message direct comme pour les livraisons.
        </p>
        <div className="adm-export-row" style={{ marginTop: 12 }}>
          <Link to="/admin/messages" className="adm-btn adm-btn--primary adm-btn--sm">Ouvrir la messagerie →</Link>
        </div>
      </header>

      <div className="adm-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`adm-tab${tab === t.id ? ' adm-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <AdminRegionalStaffList
        role={active.id}
        title={`${active.label} par région`}
        subtitle={`${active.emoji} Contactez chaque ${active.label.toLowerCase()} par message direct depuis cette liste.`}
      />
    </div>
  );
};

export default AdminRegionalContactsPage;
