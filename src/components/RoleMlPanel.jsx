import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Package, Users, Stethoscope, Truck } from 'lucide-react';
import {
  fetchAdminMlPack,
  fetchClientMlPack,
  fetchClientMlAgentPack,
  fetchLivreurMlPack,
  fetchVetMlPack,
} from '../services/mlService';

const badge = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
  background: '#f3e8ff',
  color: '#7c3aed',
};

const loaders = {
  client: fetchClientMlAgentPack,
  admin: fetchAdminMlPack,
  livreur: fetchLivreurMlPack,
  vet: fetchVetMlPack,
};

const titles = {
  client: 'Modèles IA pour vous',
  admin: 'Intelligence ML — administration',
  livreur: 'IA livraison',
  vet: 'IA clinique vétérinaire',
};

const icons = {
  client: Brain,
  admin: Brain,
  livreur: Truck,
  vet: Stethoscope,
};

const RoleMlPanel = ({ role = 'client', compact = false }) => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = loaders[role] || fetchClientMlPack;
  const Icon = icons[role] || Brain;

  useEffect(() => {
    load()
      .then(setPack)
      .catch(() => setPack(null))
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) {
    return <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement des modèles IA…</p>;
  }
  if (!pack) return null;

  const padding = compact ? 14 : 20;
  const marginBottom = compact ? 16 : 24;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
        borderRadius: 16,
        padding,
        marginBottom,
        border: '1px solid #e9d5ff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Icon size={22} color="#7c3aed" />
        <h2 style={{ margin: 0, fontSize: compact ? 16 : 18, fontWeight: 800 }}>{titles[role]}</h2>
        {pack.pythonPowered && <span style={badge}>XGBoost</span>}
        {pack.groqPowered && <span style={{ ...badge, background: '#ecfdf5', color: '#059669' }}>Groq</span>}
      </div>

      {pack.tip && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4c1d95' }}>{pack.tip}</p>
      )}

      {pack.summary && role === 'client' && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#5b21b6', lineHeight: 1.5 }}>
          {pack.summary.length > 320 ? `${pack.summary.slice(0, 320)}…` : pack.summary}
        </p>
      )}

      {role === 'client' && pack.topRecommendations?.length > 0 && (
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b21a8' }}>
          {pack.topRecommendations.length} produit(s) recommandé(s) — dont « {pack.topRecommendations[0].name} »
        </p>
      )}

      {role === 'client' && pack.petRankings?.length > 1 && (
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b21a8' }}>
          Classement XGBoost pour {pack.petRankings.length} animal(aux)
        </p>
      )}

      {role === 'client' && pack.rebuyScore && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4c1d95' }}>
          Probabilité de rachat : <strong>{(pack.rebuyScore.rebuyProbability * 100).toFixed(0)}%</strong>
          {' '}({pack.rebuyScore.riskLabel})
        </p>
      )}

      {role === 'admin' && pack.nextMonthRevenue && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4c1d95' }}>
          <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          CA prévu mois prochain : <strong>{Number(pack.nextMonthRevenue.predicted || 0).toLocaleString('fr-FR')} DT</strong>
        </p>
      )}

      {role === 'livreur' && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#5b21b6' }}>
            Secteur : <strong>{pack.region}</strong> · Heures chargées : {pack.busyHoursHint}
          </p>
          {pack.todayDeliveriesForecast != null && (
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#4c1d95' }}>
              <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Prévision : <strong>{pack.todayDeliveriesForecast}</strong> livraison(s)
              {pack.commissionForecastDt != null && ` · ~${pack.commissionForecastDt} DT`}
            </p>
          )}
          {pack.poolPriority?.length > 0 && (
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b21a8' }}>
              Top course IA : #{String(pack.poolPriority[0].orderId).slice(-6)} (score {pack.poolPriority[0].priorityScore})
            </p>
          )}
          {pack.highCancelRiskDeliveries?.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#7c2d12' }}>
              {pack.highCancelRiskDeliveries.slice(0, 4).map((r) => (
                <li key={r.orderId}>
                  <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> Commande #{String(r.orderId).slice(-6)} — risque {((r.cancelRisk ?? r.cancelProbability ?? 0) * 100).toFixed(0)}%
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {role === 'vet' && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#5b21b6' }}>
            <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Patients senior : <strong>{pack.seniorPetCount}</strong>
          </p>
          {pack.speciesBreakdown && (
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b21a8' }}>
              Espèces : {Object.entries(pack.speciesBreakdown).map(([k, v]) => `${k} (${v})`).join(', ')}
            </p>
          )}
        </>
      )}

      {(pack.trendingProducts || pack.productDemand || pack.nutritionDemand)?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#6b21a8' }}>
            <Package size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Tendances
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#5b21b6' }}>
            {(pack.trendingProducts || pack.productDemand || pack.nutritionDemand)
              .slice(0, 4)
              .map((p) => (
                <li key={p.productId || p.id}>{p.productName || p.name}</li>
              ))}
          </ul>
        </div>
      )}

      {role === 'vet' && pack.adoptionCatalog?.length > 0 && (
        <p style={{ margin: 0, fontSize: 12, color: '#6b21a8' }}>
          {pack.adoptionCatalog.length} animal(aux) en vente sur la plateforme — orientez les clients vers l&apos;adoption responsable.
        </p>
      )}

      {role === 'admin' && pack.churnHighRisk?.length > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b45309' }}>
          {pack.churnHighRisk.length} client(s) à risque de churn détecté(s).
        </p>
      )}
    </motion.div>
  );
};

export default RoleMlPanel;
