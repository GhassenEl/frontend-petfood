import React, { useCallback, useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { fetchVendorSalesHistory } from '../services/vendorService';
import './VendorPages.css';

const VendorSalesPage = () => {
  const [history, setHistory] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchVendorSalesHistory();
    setHistory(data.history || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = history.reduce((s, h) => s + (h.total || 0), 0);

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><TrendingUp size={24} /> Ventes & historique {demo && <span className="vnd-demo-pill">Mode démo</span>}</h1>
        <p>Consulter le chiffre d&apos;affaires et l&apos;historique des ventes marketplace.</p>
      </header>

      <div className="vnd-card" style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: '1.5rem' }}>{total.toLocaleString('fr-FR')} DT</strong>
        <span style={{ marginLeft: 8, color: '#64748b' }}>CA total ({history.length} commandes)</span>
      </div>

      <div className="vnd-card">
        {loading ? <p className="vnd-empty">Chargement…</p> : (
          <table className="vnd-table">
            <thead><tr><th>Commande</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.orderId}</td>
                  <td>{new Date(h.date).toLocaleDateString('fr-FR')}</td>
                  <td>{h.items}</td>
                  <td>{h.total} DT</td>
                  <td>{h.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorSalesPage;
