import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import api from '../utils/api';
import { DEMO_ADMIN_USERS, withDemoFallback } from '../utils/adminDemoData';
import './AdminPages.css';

const AdminVetsPage = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then((r) => {
      const list = withDemoFallback(r.data || [], DEMO_ADMIN_USERS).filter((u) => u.role === 'vet');
      setVets(list);
    }).catch(() => {
      setVets(DEMO_ADMIN_USERS.filter((u) => u.role === 'vet'));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Stethoscope size={24} /> Gestion des vétérinaires</h1>
        <p>Comptes vétérinaires partenaires — création et suspension via la gestion utilisateurs.</p>
      </header>

      <div className="adm-export-row">
        <Link to="/admin/users" className="adm-btn adm-btn--primary adm-btn--sm">Gérer tous les utilisateurs →</Link>
        <Link to="/admin/veterinary" className="adm-btn adm-btn--ghost adm-btn--sm">Dossiers cliniques →</Link>
      </div>

      <div className="adm-card">
        {loading ? <p>Chargement…</p> : (
          <table className="adm-table">
            <thead><tr><th>Vétérinaire</th><th>Contact</th><th>Clinique</th><th>Statut</th></tr></thead>
            <tbody>
              {vets.map((v) => (
                <tr key={v.id || v._id}>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.email}<br /><small>{v.phone}</small></td>
                  <td>{v.address || '—'}</td>
                  <td><span className={`adm-badge adm-badge--${v.isActive !== false ? 'active' : 'suspended'}`}>{v.isActive !== false ? 'Actif' : 'Inactif'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminVetsPage;
