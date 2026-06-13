import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import {
  fetchAdminActivityLogs,
  exportLogsJson,
  exportLogsCsv,
} from '../services/adminService';
import { ROLE_LABELS } from '../services/activityLogService';
import './AdminPages.css';

const ACTION_LABELS = {
  config_update: 'Mise à jour configuration',
  visitor_config_update: 'Config. espace visiteur',
  vendor_approve: 'Vendeur validé',
  vendor_suspend: 'Vendeur suspendu',
  moderator_create: 'Modérateur créé',
  moderator_suspend: 'Modérateur suspendu',
  moderator_reactivate: 'Modérateur réactivé',
  approve_product: 'Produit validé',
  reject_product: 'Produit refusé',
  create_product: 'Produit créé',
  update_stock: 'Stock mis à jour',
  accept_order: 'Commande acceptée',
  suspend_user: 'Utilisateur suspendu',
  reactivate_user: 'Utilisateur réactivé',
  reject_review: 'Avis rejeté',
  resolve_dispute: 'Litige résolu',
  place_order: 'Commande passée',
  submit_complaint: 'Réclamation déposée',
  delivery_complete: 'Livraison terminée',
  appointment_confirm: 'RDV confirmé',
  prescription_issue: 'Ordonnance émise',
  fake_review_detected: 'Faux avis détecté',
  route_start: 'Tournée démarrée',
  flag_abusive: 'Comportement signalé',
  delete_content: 'Contenu supprimé',
};

const ROLE_OPTIONS = [
  { id: 'all', label: 'Tous les acteurs' },
  { id: 'admin', label: 'Admin' },
  { id: 'vendor', label: 'Vendeur' },
  { id: 'moderator', label: 'Modérateur' },
  { id: 'client', label: 'Client' },
  { id: 'livreur', label: 'Livreur' },
  { id: 'vet', label: 'Vétérinaire' },
  { id: 'system', label: 'Système' },
];

const MODULE_OPTIONS = [
  { id: 'all', label: 'Tous modules' },
  { id: 'admin', label: 'Admin' },
  { id: 'vendor', label: 'Vendeur' },
  { id: 'moderation', label: 'Modération' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'livraison', label: 'Livraison' },
  { id: 'sante', label: 'Santé' },
];

const AdminActivityLogsPage = () => {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchAdminActivityLogs({
      role: roleFilter,
      module: moduleFilter,
      search,
    });
    setLogs(data);
    setDemo(isDemo);
    setLoading(false);
  }, [roleFilter, moduleFilter, search]);

  useEffect(() => { load(); }, [load]);

  const exportFilters = { role: roleFilter, module: moduleFilter, search };

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><FileText size={24} /> Journal d&apos;activité {demo && <span className="adm-demo-pill">Mode démo</span>}</h1>
        <p>Historique des actions — admin, vendeurs, modérateurs, clients, livreurs et vétérinaires. Exportable en fichier.</p>
      </header>

      <div className="adm-export-row">
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => exportLogsJson(exportFilters)}>
          <Download size={14} /> Export JSON
        </button>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => exportLogsCsv(exportFilters)}>
          <Download size={14} /> Export CSV
        </button>
        <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>
          {logs.length} entrée(s) affichée(s)
        </span>
      </div>

      <div className="adm-filters">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
          {MODULE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <input
          placeholder="Rechercher action, cible, acteur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
      </div>

      <div className="adm-card">
        {loading ? <p>Chargement des logs…</p> : logs.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aucune entrée pour ces filtres.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Acteur</th>
                <th>Action</th>
                <th>Cible</th>
                <th>Module</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                    {new Date(l.at).toLocaleString('fr-FR')}
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge--${l.actorRole}`}>
                      {ROLE_LABELS[l.actorRole] || l.actorRole}
                    </span>
                    <br /><small>{l.actorName}</small>
                  </td>
                  <td className="adm-log-action">{ACTION_LABELS[l.action] || l.action}</td>
                  <td>{l.target}</td>
                  <td>{l.module}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{l.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLogsPage;
