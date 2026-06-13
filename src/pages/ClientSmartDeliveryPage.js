import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Package, Truck, Clock, Brain, Video, ShoppingCart, AlertTriangle,
} from 'lucide-react';
import api from '../utils/api';
import {
  fetchPredictiveDelivery,
  proposeAutoOrder,
  fetchLiveDeliveries,
  analyzeEmotions,
} from '../services/ecosystemService';
import { formatDT } from '../utils/formatCurrency';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const urgencyColor = { high: '#dc2626', medium: '#d97706', low: '#16a34a' };

const EmotionBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span>{label}</span>
      <strong>{Math.round(value * 100)} %</strong>
    </div>
    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, marginTop: 4 }}>
      <div
        style={{
          width: `${Math.min(100, value * 100)}%`,
          height: '100%',
          background: color,
          borderRadius: 4,
        }}
      />
    </div>
  </div>
);

const ClientSmartDeliveryPage = () => {
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [predictive, setPredictive] = useState(null);
  const [live, setLive] = useState(null);
  const [emotionHint, setEmotionHint] = useState('');
  const [emotionResult, setEmotionResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [pred, liveData, pRes] = await Promise.all([
        fetchPredictiveDelivery({ petId: petId || undefined }),
        fetchLiveDeliveries(),
        api.get('/pets').catch(() => ({ data: [] })),
      ]);
      setPredictive(pred);
      setLive(liveData);
      const pl = pRes.data || [];
      setPets(pl);
      if (!petId && pl[0]?.id) setPetId(pl[0].id);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const t = setInterval(() => {
      fetchLiveDeliveries().then(setLive).catch(() => {});
    }, 20000);
    return () => clearInterval(t);
  }, []);

  const track = live?.active?.[0];
  const dest = track?.destination;
  const liv = track?.livreur;
  const mapCenter = live?.mapCenter || dest || { lat: 36.8065, lng: 10.1815 };

  const handleProposeOrder = async () => {
    setMsg('');
    try {
      const r = await proposeAutoOrder({ petId });
      setMsg(r.cart?.message || 'Panier proposé — finalisez dans la boutique');
    } catch (e) {
      setMsg(e.response?.data?.error || 'Erreur');
    }
  };

  const handleEmotion = async () => {
    if (!emotionHint.trim()) return;
    setMsg('');
    try {
      const r = await analyzeEmotions({ videoHint: emotionHint, behaviorHint: emotionHint, petId });
      setEmotionResult(r.results);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Erreur analyse');
    }
  };

  if (loading && !predictive) {
    return <p style={{ padding: 24 }}>Chargement livraison intelligente…</p>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 800, marginBottom: 8 }}>
        <Truck size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Livraison intelligente & bien-être
      </h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        Prédiction de rupture alimentaire, suivi GPS temps réel et analyse émotionnelle (vidéo / comportement).
      </p>

      {pets.length > 0 && (
        <select
          value={petId}
          onChange={(e) => setPetId(e.target.value)}
          style={{ padding: 10, borderRadius: 8, marginBottom: 16 }}
        >
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.type})
            </option>
          ))}
        </select>
      )}

      {msg && <p style={{ color: '#0d9488', marginBottom: 12 }}>{msg}</p>}

      {/* Livraison prédictive */}
      <div style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>
          <Package size={20} style={{ verticalAlign: 'middle' }} /> Livraison prédictive
        </h2>
        <p style={{ margin: '0 0 12px', color: '#475569' }}>
          Le système estime quand la nourriture va manquer et propose une commande automatique.
        </p>
        {predictive && (
          <>
            <p
              style={{
                padding: 12,
                borderRadius: 10,
                background: `${urgencyColor[predictive.urgency] || '#64748b'}15`,
                color: urgencyColor[predictive.urgency] || '#334155',
                fontWeight: 600,
              }}
            >
              {predictive.alert}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Jours restants</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{predictive.daysUntilEmpty}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Stock estimé</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{predictive.stockGrams} g</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Rupture estimée</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  {predictive.runOutAt ? new Date(predictive.runOutAt).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
            </div>
            {predictive.proposedOrder?.items?.length > 0 && (
              <div style={{ marginTop: 16, padding: 14, background: '#f0fdfa', borderRadius: 12 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700 }}>
                  <ShoppingCart size={16} style={{ verticalAlign: 'middle' }} /> Proposition automatique
                </p>
                <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>
                  {predictive.proposedOrder.items.map((it) => (
                    <li key={it.productId}>
                      {it.name} × {it.quantity} — {formatDT(it.unitPrice)}
                    </li>
                  ))}
                </ul>
                <p style={{ margin: '0 0 10px' }}>
                  Total : <strong>{formatDT(predictive.proposedOrder.subtotal)}</strong>
                  {predictive.proposedOrder.discountPercent
                    ? ` (-${predictive.proposedOrder.discountPercent} % abonnement)`
                    : ''}
                </p>
                <button
                  type="button"
                  onClick={handleProposeOrder}
                  style={{
                    padding: '10px 16px', borderRadius: 10, border: 'none',
                    background: '#0d9488', color: '#fff', fontWeight: 700, cursor: 'pointer', marginRight: 8,
                  }}
                >
                  Valider la proposition
                </button>
                <Link to="/client-products" style={{ fontSize: 14 }}>Voir la boutique →</Link>
              </div>
            )}
            {predictive.feederLinked && (
              <p style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
                <Brain size={14} style={{ verticalAlign: 'middle' }} /> Données distributeur IoT prises en compte —{' '}
                <Link to="/pet-feeder">Distributeur</Link>
              </p>
            )}
          </>
        )}
      </div>

      {/* Géolocalisation */}
      <div style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>
          <Truck size={20} style={{ verticalAlign: 'middle' }} /> Livraison géolocalisée (temps réel)
        </h2>
        {track ? (
          <>
            <p style={{ margin: '0 0 8px' }}>
              <Clock size={16} style={{ verticalAlign: 'middle' }} /> Arrivée estimée :{' '}
              <strong>{track.etaMinutes} min</strong> (fenêtre {track.etaWindow})
            </p>
            <p style={{ margin: '0 0 12px', color: '#64748b' }}>
              {track.address || track.region} — {track.distanceKmRemaining} km restants — progression{' '}
              {track.progressPercent} %
            </p>
            <div style={{ height: 280, borderRadius: 12, overflow: 'hidden' }}>
              <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {dest && (
                  <Marker position={[dest.lat, dest.lng]}>
                    <Popup>Destination</Popup>
                  </Marker>
                )}
                {liv && (
                  <Marker position={[liv.lat, liv.lng]}>
                    <Popup>Livreur — ETA {track.etaMinutes} min</Popup>
                  </Marker>
                )}
                {liv && dest && (
                  <Polyline
                    positions={[
                      [liv.lat, liv.lng],
                      [dest.lat, dest.lng],
                    ]}
                    color="#0d9488"
                  />
                )}
              </MapContainer>
            </div>
          </>
        ) : (
          <p style={{ color: '#94a3b8' }}>Aucune livraison en cours. Passez une commande pour activer le suivi.</p>
        )}
      </div>

      {/* Émotions */}
      <div style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>
          <Video size={20} style={{ verticalAlign: 'middle' }} /> Détection des émotions de l&apos;animal
        </h2>
        <p style={{ margin: '0 0 12px', color: '#475569' }}>
          Décrivez la vidéo ou le comportement (visage, posture, vocalises). Estimation : stress, fatigue, joie, agressivité.
        </p>
        <textarea
          value={emotionHint}
          onChange={(e) => setEmotionHint(e.target.value)}
          rows={4}
          placeholder="Ex. : le chien remue la queue, joue ; parfois grogne quand on approche du bol…"
          style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 10, border: '1px solid #e2e8f0' }}
        />
        <button
          type="button"
          onClick={handleEmotion}
          style={{
            padding: '10px 16px', borderRadius: 10, border: 'none',
            background: '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Analyser émotions
        </button>
        {emotionResult && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 700 }}>
              Émotion dominante : {emotionResult.dominantLabel || emotionResult.dominant}
              {emotionResult.confidence ? ` (${Math.round(emotionResult.confidence * 100)} % conf.)` : ''}
            </p>
            <EmotionBar label="Stress" value={emotionResult.emotions?.stress ?? 0} color="#f59e0b" />
            <EmotionBar label="Fatigue" value={emotionResult.emotions?.fatigue ?? 0} color="#6366f1" />
            <EmotionBar label="Joie" value={emotionResult.emotions?.joy ?? 0} color="#22c55e" />
            <EmotionBar label="Agressivité" value={emotionResult.emotions?.aggressiveness ?? 0} color="#ef4444" />
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>{emotionResult.behaviorNotes}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
              <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> {emotionResult.disclaimer}
            </p>
          </div>
        )}
      </div>

      <p style={{ fontSize: 14 }}>
        <Link to="/client-ecosystem">← Retour à l’Assistant IA</Link>
      </p>
    </div>
  );
};

export default ClientSmartDeliveryPage;
