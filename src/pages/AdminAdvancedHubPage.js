import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, RefreshCw } from 'lucide-react';
import { ADMIN_HUB_SECTIONS } from '../config/adminHubCatalog';
import api from '../utils/api';
import { withDemoStats } from '../utils/adminDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminPages.css';

const AdminAdvancedHubPage = () => {
  const [stats, setStats] = useState(withDemoStats(null));
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        api.get('/orders/stats').catch(() => ({ data: {} })),
        api.get('/users/count').catch(() => ({ data: {} })),
      ]);
      setStats(withDemoStats({
        totalOrders: ordersRes.data.total || 0,
        totalRevenue: ordersRes.data.revenue || 0,
        totalUsers: usersRes.data.count || 0,
        pendingOrders: ordersRes.data.pending || 0,
      }));
    } catch {
      setStats(withDemoStats(null));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  usePlatformRefresh(load);

  return (
    <div className="adm-page adm-hub">
      <header className="adm-hub-hero">
        <div>
          <span className="adm-hub-hero__badge">PetFoodTN 2026 · Admin</span>
          <h1><LayoutGrid size={28} aria-hidden /> Fonctionnalités avancées Administrateur</h1>
          <p>
            Hub unifié — utilisateurs, produits, commandes, BI, IA, qualité IoT PetFoodIoT,
            livraisons, sécurité et rapports.
          </p>
        </div>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> Actualiser
        </button>
      </header>

      {!loading && (
        <div className="adm-hub-kpis">
          <div className="adm-hub-kpi">
            <strong>{stats.totalOrders}</strong>
            <span>Commandes</span>
          </div>
          <div className="adm-hub-kpi">
            <strong>{stats.totalRevenue?.toLocaleString('fr-FR')} DT</strong>
            <span>Chiffre d&apos;affaires</span>
          </div>
          <div className="adm-hub-kpi">
            <strong>{stats.totalUsers}</strong>
            <span>Utilisateurs</span>
          </div>
          <div className="adm-hub-kpi adm-hub-kpi--warn">
            <strong>{stats.pendingOrders}</strong>
            <span>En attente</span>
          </div>
        </div>
      )}

      <div className="adm-hub-grid">
        {ADMIN_HUB_SECTIONS.map((section) => (
          <article
            key={section.id}
            className="adm-hub-card"
            style={{ '--hub-accent': section.color }}
          >
            <div className="adm-hub-card__head">
              <span className="adm-hub-card__icon">{section.icon}</span>
              <h2>{section.title}</h2>
            </div>
            <p className="adm-hub-card__desc">{section.description}</p>
            <ul className="adm-hub-card__features">
              {section.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="adm-hub-card__links">
              {section.links.map(({ label, route }) => (
                <Link key={route} to={route} className="adm-hub-link">
                  {label} →
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminAdvancedHubPage;
