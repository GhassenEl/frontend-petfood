import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Scissors, Home, GraduationCap, Truck, Stethoscope, ShoppingBag } from 'lucide-react';
import useOwnerEmotionDashboard from '../hooks/useOwnerEmotionDashboard';
import ClientServiceRatingsPanel from '../components/ClientServiceRatingsPanel';
import { emotionMeta, EMOTION_STYLE } from '../constants/ownerEmotions';
import { analyzeOwnerEmotion } from '../services/ownerEmotionService';
import './ClientComplaintsPage.css';

const SERVICE_ICONS = {
  grooming: Scissors,
  boarding: Home,
  training: GraduationCap,
  delivery: Truck,
  veterinary: Stethoscope,
  products: ShoppingBag,
};

const ClientOwnerEmotionsPage = () => {
  const { data, loading, reload } = useOwnerEmotionDashboard();
  const [probeText, setProbeText] = useState('');
  const [probeService, setProbeService] = useState('grooming');
  const [probeResult, setProbeResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const runProbe = async () => {
    if (!probeText.trim()) return;
    setAnalyzing(true);
    try {
      const r = await analyzeOwnerEmotion({ text: probeText, serviceType: probeService });
      setProbeResult(r);
    } catch {
      setProbeResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="cc-page" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <Heart size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Analyse de vos émotions
        </h1>
        <p style={{ margin: 0, opacity: 0.9, maxWidth: 560 }}>
          Comprenez votre ressenti envers les services PetfoodTN : toilettage, pension, dressage, livraison,
          vétérinaire et produits.
        </p>
        <button type="button" onClick={reload} style={btnLight}>
          Actualiser
        </button>
      </motion.div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Analyse de votre profil émotionnel…</p>
      ) : !data ? (
        <p style={{ color: '#dc2626' }}>Tableau indisponible. Vérifiez que le backend est démarré.</p>
      ) : (
        <>
          <div className="cc-stats" style={{ marginBottom: 20 }}>
            <div className="cc-stat">
              <strong style={{ color: '#be185d', fontSize: '1.4rem' }}>{data.globalMoodLabel}</strong>
              <span>Humeur globale</span>
            </div>
            <div className="cc-stat">
              <strong>{data.totalFeedbacks}</strong>
              <span>Retours enregistrés</span>
            </div>
            <div className="cc-stat">
              <strong>{(data.serviceBreakdown || []).filter((s) => s.count > 0).length}</strong>
              <span>Services notés</span>
            </div>
          </div>

          {data.summary && (
            <div className="cc-form-card" style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} color="#be185d" />
                Synthèse
              </h2>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {(data.serviceBreakdown || []).map((svc) => {
              const Icon = SERVICE_ICONS[svc.type] || Heart;
              const style = EMOTION_STYLE[svc.dominantEmotion] || EMOTION_STYLE.neutral;
              return (
                <div
                  key={svc.type}
                  className="cc-form-card"
                  style={{ borderLeft: `4px solid ${style.color}`, opacity: svc.count ? 1 : 0.65 }}
                >
                  <h3 style={{ margin: '0 0 8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={18} />
                    {svc.icon} {svc.label}
                  </h3>
                  {svc.count > 0 ? (
                    <>
                      <p style={{ margin: '0 0 6px', fontSize: 14 }}>
                        {svc.count} retour(s) · note moy. {svc.avgRating ?? '—'}/5
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: style.bg,
                          color: style.color,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {emotionMeta(svc.dominantEmotion).emoji} {emotionMeta(svc.dominantEmotion).label}
                      </span>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Aucun retour pour l&apos;instant</p>
                  )}
                  {svc.type === 'grooming' || svc.type === 'training' || svc.type === 'boarding' ? (
                    <Link to="/client-services" style={{ fontSize: 12, color: '#be185d', display: 'block', marginTop: 8 }}>
                      Réserver →
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>

          {data.recommendations?.length > 0 && (
            <div className="cc-form-card" style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 12px' }}>Recommandations</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {data.recommendations.map((rec) => (
                  <Link key={rec.type} to={rec.link} className="cc-cat-btn active" style={{ textDecoration: 'none' }}>
                    {rec.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="cc-form-card" style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 12px' }}>Tester l&apos;analyse IA sur un commentaire</h2>
            <div className="cc-field">
              <label>Service concerné</label>
              <select value={probeService} onChange={(e) => setProbeService(e.target.value)}>
                {(data.platformServices || []).map((s) => (
                  <option key={s.type} value={s.type}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-field">
              <label>Votre commentaire</label>
              <textarea
                value={probeText}
                onChange={(e) => setProbeText(e.target.value)}
                rows={3}
                placeholder="Ex. : Le toilettage était parfait, mon chien est tout doux…"
                maxLength={800}
              />
            </div>
            <button type="button" className="cc-submit reviews" onClick={runProbe} disabled={analyzing}>
              {analyzing ? 'Analyse…' : 'Analyser mon ressenti'}
            </button>
            {probeResult && (
              <p style={{ marginTop: 12, padding: 12, background: '#fdf2f8', borderRadius: 12 }}>
                {probeResult.emotionEmoji} <strong>{probeResult.emotionLabel}</strong>
                {probeResult.confidence != null && ` (${Math.round(probeResult.confidence * 100)} % confiance)`}
                {probeResult.summary && ` — ${probeResult.summary}`}
              </p>
            )}
          </div>

          <ClientServiceRatingsPanel />
        </>
      )}
    </div>
  );
};

const btnLight = {
  marginTop: 12,
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.4)',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
};

export default ClientOwnerEmotionsPage;
