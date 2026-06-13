import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { fetchSupportReturns } from '../services/supportService';
import { REFUND_STATUS_LABELS } from '../services/refundService';
import { REFUND_REASON_LABELS } from '../utils/refundDemoData';
import './SupportPages.css';

const SupportReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchSupportReturns();
    setReturns(data.returns || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="sup-page">
      <header className="sup-hero">
        <h1><RotateCcw size={24} /> Demandes de retour {demo && <span className="sup-demo-pill">Mode démo</span>}</h1>
        <p>Traiter les demandes de retour et remboursement en cours.</p>
      </header>
      <div className="sup-card">
        {loading ? <p className="sup-empty">Chargement…</p> : (
          <table className="sup-table">
            <thead><tr><th>Commande</th><th>Client</th><th>Produit</th><th>Montant</th><th>Motif</th><th>Statut</th></tr></thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td>{r.orderId}</td>
                  <td>{r.clientName}</td>
                  <td>{r.productName}</td>
                  <td>{r.amount} DT</td>
                  <td>{REFUND_REASON_LABELS[r.reasonCategory] || r.reason}</td>
                  <td>{REFUND_STATUS_LABELS[r.status] || r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SupportReturnsPage;
