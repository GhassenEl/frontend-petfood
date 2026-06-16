import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const LivreurParcelPriorityPanel = ({ parcels, loading }) => {
  if (loading) return <p className="livih-muted">Priorisation colis…</p>;
  const p = parcels || {};

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <Package size={16} aria-hidden />
        Priorisation des livraisons urgentes et commandes contenant des produits sensibles.
      </p>
      <p className="livih-ai-text">{p.aiSummary}</p>
      <table className="livih-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Commande</th>
            <th>Score</th>
            <th>Type</th>
            <th>Conseil</th>
          </tr>
        </thead>
        <tbody>
          {(p.parcels || []).map((row, i) => (
            <tr key={row.orderId}>
              <td>{i + 1}</td>
              <td>
                <strong>#{String(row.orderId).slice(-6)}</strong>
                <br /><small>{row.region}</small>
              </td>
              <td className="livih-score">{row.priorityScore}</td>
              <td>
                {row.urgent && <span className="livih-chip livih-chip--urgent">Urgent</span>}
                {row.sensitive && <span className="livih-chip livih-chip--sensitive">Sensible</span>}
                {!row.urgent && !row.sensitive && <span className="livih-chip">{row.label}</span>}
              </td>
              <td className="livih-rec">{row.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/livreur/orders" className="livih-link">Voir commandes →</Link>
    </div>
  );
};

export default LivreurParcelPriorityPanel;
