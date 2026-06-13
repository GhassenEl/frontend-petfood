import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { fetchVendorReturns, updateVendorReturn } from '../services/vendorService';
import './VendorPages.css';

const RETURN_STATUS = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
  refunded: 'Remboursé',
};

const VendorReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchVendorReturns();
    setReturns(data.returns || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handle = async (id, status) => {
    await updateVendorReturn(id, status);
    load();
  };

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><RotateCcw size={24} /> Gestion des retours {demo && <span className="vnd-demo-pill">Mode démo</span>}</h1>
        <p>Traiter les demandes de retour et remboursement de vos clients.</p>
      </header>

      <div className="vnd-card">
        {loading ? <p className="vnd-empty">Chargement…</p> : returns.length === 0 ? (
          <p className="vnd-empty">Aucun retour en cours.</p>
        ) : (
          <table className="vnd-table">
            <thead>
              <tr><th>Commande</th><th>Client</th><th>Produit</th><th>Motif</th><th>Date</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td>{r.orderId}</td>
                  <td>{r.clientName}</td>
                  <td>{r.productName}</td>
                  <td style={{ maxWidth: 200 }}>{r.reason}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td><span className={`vnd-badge vnd-badge--${r.status === 'pending' ? 'pending' : r.status}`}>{RETURN_STATUS[r.status]}</span></td>
                  <td>
                    {r.status === 'pending' && (
                      <>
                        <button type="button" className="vnd-btn vnd-btn--primary vnd-btn--sm" onClick={() => handle(r.id, 'approved')}><Check size={14} /> Approuver</button>
                        {' '}
                        <button type="button" className="vnd-btn vnd-btn--danger vnd-btn--sm" onClick={() => handle(r.id, 'rejected')}><X size={14} /> Refuser</button>
                      </>
                    )}
                    {r.status === 'approved' && (
                      <button type="button" className="vnd-btn vnd-btn--ghost vnd-btn--sm" onClick={() => handle(r.id, 'refunded')}>Marquer remboursé</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorReturnsPage;
