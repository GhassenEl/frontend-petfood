import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { getReportCatalog, exportReport } from '../services/adminReportsService';
import './AdminPages.css';

const REPORTS = [
  { id: 'sales', icon: '💰', exportFn: () => exportReport('sales') },
  { id: 'iot', icon: '📡', exportFn: () => exportReport('iot') },
  { id: 'vet', icon: '🩺', exportFn: () => exportReport('vet') },
  { id: 'satisfaction', icon: '⭐', exportFn: () => exportReport('satisfaction') },
  { id: 'users', icon: '👥', exportFn: () => exportReport('users') },
];

const AdminReportsPage = () => {
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('type');
  const catalog = getReportCatalog();
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');

  const handleExport = useCallback(async (id, fn) => {
    setBusy(id);
    setMsg('');
    try {
      const result = await fn();
      setMsg(`Export ${id} — ${result.count ?? '—'} enregistrement(s) (${result.format}${result.mode ? ` · ${result.mode}` : ''})`);
    } catch (e) {
      setMsg(`Erreur export : ${e.message}`);
    } finally {
      setBusy(null);
    }
  }, []);

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><FileText size={24} /> Rapports et analyses</h1>
        <p>
          Export PDF (factures), CSV / Excel-compatible et JSON — ventes, IoT PetFoodIoT,
          vétérinaire et satisfaction client.
        </p>
      </header>

      {msg && <p className="adm-banner adm-banner--info">{msg}</p>}

      <div className="adm-reports-grid">
        {REPORTS.map(({ id, icon, exportFn }) => {
          const meta = catalog[id];
          const highlighted = highlight === id;
          return (
            <article
              key={id}
              className={`adm-report-card${highlighted ? ' adm-report-card--highlight' : ''}`}
            >
              <span className="adm-report-card__icon">{icon}</span>
              <h3>{meta.label}</h3>
              <p>{meta.description}</p>
              <div className="adm-report-card__actions">
                <button
                  type="button"
                  className="adm-btn adm-btn--primary adm-btn--sm"
                  disabled={busy === id}
                  onClick={() => handleExport(id, exportFn)}
                >
                  <Download size={14} />
                  {busy === id ? 'Export…' : 'Exporter CSV / JSON'}
                </button>
                {id === 'sales' && (
                  <a href="/admin/invoices" className="adm-btn adm-btn--ghost adm-btn--sm">
                    <FileSpreadsheet size={14} /> Factures PDF →
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <section className="adm-card" style={{ marginTop: 20 }}>
        <h3>Formats supportés</h3>
        <ul className="adm-hub-card__features">
          <li><strong>CSV</strong> — compatible Excel (ventes, IoT, utilisateurs, vétérinaire)</li>
          <li><strong>JSON</strong> — satisfaction client (avis + réclamations)</li>
          <li><strong>PDF</strong> — factures via <a href="/admin/invoices">Gestion factures</a></li>
        </ul>
      </section>
    </div>
  );
};

export default AdminReportsPage;
