import React, { useEffect, useState } from 'react';
import { Percent, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { computeAutoDiscountSuggestions } from '../utils/adminAutoDiscountEngine';
import './AdminAutoDiscountPanel.css';

const AdminAutoDiscountPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products');
        const list = (data || []).map((p) => ({
          ...p,
          daysSinceListed: p.createdAt ? Math.floor((Date.now() - new Date(p.createdAt)) / 86400000) : 30,
          salesCount: p.salesCount ?? Math.floor(Math.random() * 20),
        }));
        setSuggestions(computeAutoDiscountSuggestions(list.length ? list : DEMO_PRODUCTS));
      } catch {
        setSuggestions(computeAutoDiscountSuggestions(DEMO_PRODUCTS));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="autodisc-panel">
      <h3><Sparkles size={18} /> Calcul automatique des remises</h3>
      <p className="autodisc-lead">Suggestions basées sur stock, saisonnalité et rotation produits.</p>
      {loading ? (
        <p>Calcul en cours…</p>
      ) : suggestions.length === 0 ? (
        <p>Aucune remise suggérée pour le moment.</p>
      ) : (
        <table className="autodisc-table">
          <thead>
            <tr><th>Produit</th><th>Catégorie</th><th>Stock</th><th>Remise suggérée</th><th>Impact</th><th>Raisons</th></tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.category}</td>
                <td>{s.stock}</td>
                <td><span className="autodisc-pct"><Percent size={12} /> {s.suggestedPct} %</span></td>
                <td>{s.estimatedMarginImpact}</td>
                <td><small>{s.reasons.join(' · ')}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const DEMO_PRODUCTS = [
  { id: 'd1', name: 'Croquettes chien 12 kg', category: 'croquettes', price: 89, stock: 95, daysSinceListed: 120, salesCount: 3 },
  { id: 'd2', name: 'Jouet interactif chat', category: 'jouets', price: 24, stock: 42, daysSinceListed: 45, salesCount: 12 },
  { id: 'd3', name: 'Litière 10 L', category: 'accessoires', price: 18, stock: 8, daysSinceListed: 20, salesCount: 30 },
  { id: 'd4', name: 'Friandises dentaires', category: 'friandises', price: 15, stock: 60, daysSinceListed: 60, salesCount: 8 },
];

export default AdminAutoDiscountPanel;
