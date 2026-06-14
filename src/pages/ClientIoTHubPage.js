import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wifi, AlertTriangle, ChevronRight, Cpu, RefreshCw,
} from 'lucide-react';
import api from '../utils/api';
import {
  fetchWaterMonitorOverview,
  fetchLiveDeliveries,
  fetchTraceabilityList,
  fetchWaterAlerts,
} from '../services/ecosystemService';
import WaterIoTAlertsPanel from '../components/WaterIoTAlertsPanel';
import {
  getDemoFeederList,
  getDemoFeederBundle,
  getDemoWaterOverview,
  getDemoWaterTracking,
  DEMO_WATER_PETS,
} from '../utils/clientDemoData';
import './ClientComplaintsPage.css';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  border: '1px solid #f1f5f9',
};

const IoTModuleCard = ({ to, icon, title, subtitle, status, statusColor, badge }) => (
  <Link
    to={to}
    style={{
      ...card,
      display: 'block',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.45 }}>{subtitle}</p>
        {badge && (
          <span style={{ display: 'inline-block', marginTop: 10, fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: 999 }}>
            {badge}
          </span>
        )}
      </div>
      <ChevronRight size={20} color="#94a3b8" style={{ flexShrink: 0, marginTop: 4 }} />
    </div>
    {status && (
      <p style={{ margin: '14px 0 0', fontSize: 13, fontWeight: 700, color: statusColor || '#475569' }}>
        {status}
      </p>
    )}
  </Link>
);

const ClientIoTHubPage = () => {
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [feeders, setFeeders] = useState([]);
  const [feederAlerts, setFeederAlerts] = useState([]);
  const [waterPets, setWaterPets] = useState([]);
  const [waterAlerts, setWaterAlerts] = useState([]);
  const [waterAlertSummary, setWaterAlertSummary] = useState(null);
  const [liveDeliveries, setLiveDeliveries] = useState(0);
  const [traceCount, setTraceCount] = useState(0);

  const load = async () => {
    setLoading(true);
    let usedDemo = false;

    try {
      const [feederRes, waterRes, liveRes, traceRes] = await Promise.all([
        api.get('/feeder').catch(() => {
          usedDemo = true;
          return { data: getDemoFeederList() };
        }),
        fetchWaterMonitorOverview().catch(() => {
          usedDemo = true;
          return getDemoWaterOverview();
        }),
        fetchLiveDeliveries().catch(() => ({ deliveries: [] })),
        fetchTraceabilityList({ limit: 20 }).catch(() => ({ traces: [] })),
      ]);

      const feederList = Array.isArray(feederRes.data) ? feederRes.data : getDemoFeederList();
      if (!feederList.length) {
        usedDemo = true;
        setFeeders(getDemoFeederList());
      } else {
        setFeeders(feederList);
      }

      const waterPetsList = waterRes?.pets || waterRes?.data?.pets || [];
      if (!waterPetsList.length) {
        usedDemo = true;
        setWaterPets(getDemoWaterOverview().pets);
      } else {
        setWaterPets(waterPetsList);
      }

      setLiveDeliveries((liveRes?.deliveries || liveRes?.active || liveRes?.items || []).length);
      setTraceCount((traceRes?.traces || []).length);

      const feederId = feederList[0]?.id || 'demo-feeder-1';
      try {
        const { data: alerts } = await api.get(`/feeder/${feederId}/alerts`);
        setFeederAlerts(Array.isArray(alerts) ? alerts : []);
      } catch {
        const bundle = getDemoFeederBundle(feederId);
        setFeederAlerts(bundle.alerts || []);
        usedDemo = true;
      }

      if (usedDemo) setDemoMode(true);

      try {
        const alertData = await fetchWaterAlerts();
        setWaterAlerts(alertData?.alerts || []);
        setWaterAlertSummary({ count: alertData?.count, criticalCount: alertData?.criticalCount });
      } catch {
        const demoAlerts = DEMO_WATER_PETS.flatMap((p) =>
          (getDemoWaterTracking(p.petId).alerts || []).map((a) => ({ ...a, petId: p.petId, petName: p.name })),
        );
        setWaterAlerts(demoAlerts);
        setWaterAlertSummary({
          count: demoAlerts.length,
          criticalCount: demoAlerts.filter((a) => a.severity === 'high').length,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onlineFeeders = feeders.filter((f) => f.status === 'online').length;
  const lowFood = feeders.some((f) => f.isLowFood);

  return (
    <div className="cc-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <header
        className="cc-hero"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0ea5e9 100%)',
          color: 'white',
          borderRadius: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>📡 Centre IoT & connecté</h1>
            <p style={{ margin: 0, opacity: 0.9, maxWidth: 560, lineHeight: 1.5 }}>
              Pilotez distributeur, fontaine, livraison et traçabilité depuis un seul tableau de bord.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
        {demoMode && (
          <p style={{ margin: '14px 0 0', fontSize: 13, background: 'rgba(255,255,255,0.12)', display: 'inline-block', padding: '8px 14px', borderRadius: 10 }}>
            Mode démo — connectez un ESP32 ou une fontaine pour des données réelles
          </p>
        )}
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Chargement des appareils…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
            <div className="cc-stat">
              <strong style={{ color: onlineFeeders > 0 ? '#059669' : '#94a3b8' }}>{onlineFeeders}/{feeders.length}</strong>
              <span>Distributeurs en ligne</span>
            </div>
            <div className="cc-stat">
              <strong style={{ color: '#0ea5e9' }}>{waterPets.length}</strong>
              <span>Animaux suivis (eau)</span>
            </div>
            <div className="cc-stat">
              <strong style={{ color: '#f59e0b' }}>{liveDeliveries}</strong>
              <span>Livraisons actives</span>
            </div>
            <div className="cc-stat">
              <strong style={{ color: '#7c3aed' }}>{traceCount}</strong>
              <span>Produits traçables</span>
            </div>
          </div>

          {(lowFood || waterAlerts.length > 0 || feederAlerts.length > 0) && (
            <div style={{ ...card, marginBottom: 20, background: '#fffbeb', borderColor: '#fde68a' }}>
              <h3 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontSize: 15 }}>
                <AlertTriangle size={18} /> Alertes IoT
              </h3>
              {lowFood && <p style={{ margin: '4px 0', fontSize: 13, color: '#b45309' }}>🍽️ Niveau croquettes bas sur un distributeur</p>}
              {feederAlerts.slice(0, 3).map((a, i) => (
                <p key={i} style={{ margin: '4px 0', fontSize: 13, color: '#b45309' }}>{a.message || a.title || a.label}</p>
              ))}
            </div>
          )}

          {waterAlerts.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <WaterIoTAlertsPanel alerts={waterAlerts} summary={waterAlertSummary} compact />
              <Link to="/client-smart-water" style={{ fontSize: 13, fontWeight: 700, color: '#0284c7' }}>
                Voir la fontaine connectée →
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <IoTModuleCard
                to="/pet-feeder"
                icon="🍽️"
                title="Distributeur IoT"
                subtitle="Portions automatiques, horaires ESP32, capteurs niveau et température."
                status={
                  onlineFeeders > 0
                    ? `${onlineFeeders} appareil(s) en ligne${lowFood ? ' · ⚠️ stock bas' : ''}`
                    : 'Aucun appareil en ligne — configurer un ESP32'
                }
                statusColor={onlineFeeders > 0 ? '#059669' : '#94a3b8'}
                badge={demoMode ? 'Démo disponible' : null}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <IoTModuleCard
                to="/client-smart-water"
                icon="💧"
                title="Fontaine connectée"
                subtitle="Suivi hydratation, réservoir, filtres et courbes de consommation."
                status={`${waterPets.length} animal(aux) monitoré(s)`}
                statusColor="#0ea5e9"
                badge={demoMode ? 'Démo disponible' : null}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <IoTModuleCard
                to="/client-smart-delivery"
                icon="🚚"
                title="Livraison prédictive"
                subtitle="Créneaux optimisés, carte temps réel et réappro lié au distributeur."
                status={liveDeliveries > 0 ? `${liveDeliveries} livraison(s) en cours` : 'Planifier une livraison intelligente'}
                statusColor={liveDeliveries > 0 ? '#f59e0b' : '#64748b'}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <IoTModuleCard
                to="/client-traceability"
                icon="🔗"
                title="Traçabilité blockchain"
                subtitle="Origine aliments, certifications et chaîne d'approvisionnement vérifiée."
                status={traceCount > 0 ? `${traceCount} produit(s) avec registre` : 'Vérifier l\'origine d\'un produit'}
                statusColor="#7c3aed"
              />
            </motion.div>
          </div>

          <section style={card}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
              <Cpu size={20} color="#1e40af" /> Connecter un distributeur ESP32
            </h3>
            <ol style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.7 }}>
              <li>Créez un distributeur dans <Link to="/pet-feeder" style={{ color: '#2563eb', fontWeight: 700 }}>Distributeur IoT</Link></li>
              <li>Copiez la <strong>clé appareil</strong> (device key)</li>
              <li>Flashez le firmware <code>firmware/esp32/PetFeederESP32</code> avec votre Wi-Fi</li>
              <li>Vérifiez le statut <Wifi size={14} style={{ verticalAlign: 'middle' }} /> En ligne</li>
            </ol>
            <p style={{ margin: '14px 0 0', fontSize: 13, color: '#64748b' }}>
              Liens utiles :{' '}
              <Link to="/pet-calories" style={{ color: '#2563eb', fontWeight: 600 }}>Nutrition</Link>
              {' · '}
              <Link to="/client-smart-water" style={{ color: '#2563eb', fontWeight: 600 }}>Hydratation</Link>
              {' · '}
              <Link to="/platform-services" style={{ color: '#2563eb', fontWeight: 600 }}>Catalogue services</Link>
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default ClientIoTHubPage;
