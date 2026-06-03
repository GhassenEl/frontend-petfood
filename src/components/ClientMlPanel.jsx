import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Heart, Package, ArrowRight } from 'lucide-react';
import useClientMlAgent from '../hooks/useClientMlAgent';

const badge = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
  background: '#f3e8ff',
  color: '#7c3aed',
};

const ClientMlPanel = ({ compact = false }) => {
  const { data: pack, loading } = useClientMlAgent();

  if (loading) return <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement des modèles IA…</p>;
  if (!pack) return null;

  const rebuy = pack.rebuyScore;
  const ranking = pack.mlRanking?.items || pack.petRankings?.[0]?.items || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
        borderRadius: 16,
        padding: compact ? 14 : 20,
        marginBottom: compact ? 16 : 24,
        border: '1px solid #e9d5ff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Brain size={22} color="#7c3aed" />
        <h2 style={{ margin: 0, fontSize: compact ? 16 : 18, fontWeight: 800, flex: 1 }}>Agent IA Client</h2>
        {pack.pythonPowered && <span style={badge}>XGBoost</span>}
        {pack.groqPowered && <span style={{ ...badge, background: '#ecfdf5', color: '#059669' }}>Groq</span>}
        <Link to="/client-ml-agent" style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
          Tout voir <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
        </Link>
      </div>

      {pack.summary && !compact && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4c1d95', lineHeight: 1.5 }}>
          {pack.summary.length > 280 ? `${pack.summary.slice(0, 280)}…` : pack.summary}
        </p>
      )}

      {rebuy && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4c1d95' }}>
          <Heart size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Probabilité de rachat : <strong>{(rebuy.rebuyProbability * 100).toFixed(0)}%</strong>
          {' '}({rebuy.riskLabel})
        </p>
      )}

      {pack.trendingProducts?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#6b21a8' }}>
            <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Produits tendance
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#5b21b6' }}>
            {pack.trendingProducts.slice(0, compact ? 3 : 4).map((p) => (
              <li key={p.productId}>{p.productName}</li>
            ))}
          </ul>
        </div>
      )}

      {ranking.length > 0 && (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#6b21a8' }}>
            <Package size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Top IA pour {(pack.mlRanking?.pet || pack.petRankings?.[0]?.pet)?.name}
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#5b21b6' }}>
            {ranking.slice(0, compact ? 3 : 4).map((r) => (
              <li key={r.productId}>
                {r.productName} — score {((r.score ?? 0) * 100).toFixed(0)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ClientMlPanel;
