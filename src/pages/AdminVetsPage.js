import React from 'react';
import { Link } from 'react-router-dom';
import AdminRegionalStaffList from '../components/AdminRegionalStaffList';
import './AdminPages.css';

const AdminVetsPage = () => (
  <div className="adm-page">
    <div className="adm-export-row" style={{ marginBottom: 12 }}>
      <Link to="/admin/veterinary" className="adm-btn adm-btn--ghost adm-btn--sm">Dossiers cliniques →</Link>
      <Link to="/admin/regional-contacts" className="adm-btn adm-btn--ghost adm-btn--sm">Tous les contacts par région →</Link>
      <Link to="/admin/users" className="adm-btn adm-btn--primary adm-btn--sm">Gérer les utilisateurs →</Link>
    </div>
    <AdminRegionalStaffList
      role="vet"
      title="Vétérinaires par région"
      subtitle="Contactez chaque vétérinaire par message direct — téléconsultations, urgences et coordination clinique."
    />
  </div>
);

export default AdminVetsPage;
