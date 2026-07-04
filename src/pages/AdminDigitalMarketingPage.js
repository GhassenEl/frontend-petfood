import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, BarChart3, Mail, Share2, Search, RefreshCw, ExternalLink, Plug, Radio,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { fetchDigitalMarketingPack } from '../services/digitalMarketingService';
import MarketingAudienceBiPanel from '../components/MarketingAudienceBiPanel';
import './AdminDigitalMarketing.css';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'audience', label: 'Audience & BI', icon: Radio },
  { id: 'campaigns', label: 'Campagnes IA', icon: Megaphone },
  { id: 'channels', label: 'Canaux', icon: Mail },
  { id: 'social', label: 'Social & SEO', icon: Share2 },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
];

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};

const AdminDigitalMarketingPage = () => {
  const [tab, setTab] = useState('overview');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await fetchDigitalMarketingPack());
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load, [load]);

  const k = pack?.kpis || {};

  return (
    <div className="mkt-page">
      <div className="mkt-hero">
        <h1>
          <Megaphone size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
          Marketing digital
        </h1>
        <p>
          Acquisition, campagnes multicanal, SEO, réseaux sociaux et newsletter — hub central PetfoodTN.
        </p>
      </div>

      <div className="mkt-toolbar">
        <div className="mkt-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`mkt-tab${tab === id ? ' mkt-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" className="mkt-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {loading && !pack ? (
        <p style={{ color: '#94a3b8' }}>Chargement marketing digital…</p>
      ) : !pack ? (
        <p style={{ color: '#dc2626' }}>Données marketing indisponibles.</p>
      ) : (
        <>
          {tab === 'overview' && (
            <>
              <div className="mkt-kpi-grid">
                <Kpi label="Impressions" value={fmt(k.impressions)} />
                <Kpi label="Clics" value={fmt(k.clicks)} />
                <Kpi label="CTR" value={`${k.ctr} %`} />
                <Kpi label="Conversions" value={fmt(k.conversions)} />
                <Kpi label="Taux conversion" value={`${k.conversionRate} %`} />
                <Kpi label="Newsletter" value={fmt(k.newsletterSubs)} />
                <Kpi label="Ouverture email" value={`${k.emailOpenRate} %`} />
                <Kpi label="ROAS pub" value={`${k.adRoas}x`} />
                {k.onlineNow != null && <Kpi label="En ligne (live)" value={fmt(k.onlineNow)} />}
              </div>

              <MarketingAudienceBiPanel pack={pack} compact />

              <div className="mkt-grid-2">
                <div className="mkt-panel">
                  <h3>Entonnoir de conversion</h3>
                  {(pack.funnel || []).map((step) => (
                    <div key={step.stage} className="mkt-funnel-row">
                      <span style={{ width: 120, fontSize: 13, fontWeight: 600 }}>{step.stage}</span>
                      <div className="mkt-funnel-bar">
                        <div className="mkt-funnel-fill" style={{ width: `${Math.max(step.pct, 2)}%` }} />
                      </div>
                      <span style={{ width: 70, fontSize: 12, textAlign: 'right' }}>{fmt(step.count)}</span>
                    </div>
                  ))}
                </div>

                <div className="mkt-panel">
                  <h3>Trafic par canal (7 jours)</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={pack.trafficSeries || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="organic" name="Organique" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="paid" name="Payant" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="email" name="Email" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mkt-panel">
                <h3>Landing page & intégrations</h3>
                <div className="mkt-landing-preview">
                  <div>
                    <strong>{pack.landing?.url}</strong>
                    <div className="mkt-landing-stats" style={{ marginTop: 12 }}>
                      <div><strong>{fmt(pack.landing?.views)}</strong> vues</div>
                      <div><strong>{pack.landing?.bounceRate} %</strong> rebond</div>
                      <div><strong>{pack.landing?.avgSessionSec}s</strong> session moy.</div>
                    </div>
                  </div>
                  <a href="/" target="_blank" rel="noopener noreferrer" className="mkt-btn-ghost" style={{ textDecoration: 'none' }}>
                    <ExternalLink size={16} /> Voir la landing
                  </a>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                  {(pack.integrations || []).map((i) => (
                    <span key={i.id} className={`mkt-badge mkt-badge--${i.status === 'connected' ? 'connected' : 'pending'}`}>
                      <Plug size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {i.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'audience' && (
            <>
              <MarketingAudienceBiPanel pack={pack} />
              <div className="mkt-grid-2" style={{ marginTop: 16 }}>
                <div className="mkt-panel">
                  <h3>Sessions actives</h3>
                  {(pack.audienceLive?.sessions || []).length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>Aucune session live — polling toutes les 5 s sur /admin/presence/live.</p>
                  ) : (
                    <ul className="mkt-newsletter-list">
                      {pack.audienceLive.sessions.map((s) => (
                        <li key={s.sessionId || `${s.role}-${s.path}`}>
                          <strong>{s.role || '—'}</strong>
                          {s.region ? ` · ${s.region}` : ''}
                          <span style={{ color: '#94a3b8', marginLeft: 8 }}>{s.path || '/'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mkt-panel">
                  <h3>Liens décisionnels</h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>
                    Croisez audience, segmentation BI et campagnes pour cibler les bons segments en temps réel.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link to="/admin/live-audience" className="mkt-btn-ghost" style={{ textDecoration: 'none', justifyContent: 'center' }}>Audience temps réel →</Link>
                    <Link to="/admin/business-intelligence" className="mkt-btn-ghost" style={{ textDecoration: 'none', justifyContent: 'center' }}>Hub BI (segments) →</Link>
                    <Link to="/admin/powerbi" className="mkt-btn-ghost" style={{ textDecoration: 'none', justifyContent: 'center' }}>Power BI & exports →</Link>
                    <Link to="/admin/promotions" className="mkt-btn-ghost" style={{ textDecoration: 'none', justifyContent: 'center' }}>Promotions produits →</Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'campaigns' && (
            <>
              <p style={{ margin: '0 0 16px', color: '#047857', fontWeight: 600 }}>
                {pack.marketingSummary}
              </p>
              <div className="mkt-campaign-grid">
                {(pack.campaigns || []).map((c) => (
                  <article key={c.id} className={`mkt-campaign mkt-campaign--${c.priority}`}>
                    <h4>{c.title}</h4>
                    <p><strong>Cible :</strong> {c.target}</p>
                    <p><strong>Canal :</strong> {c.channel}</p>
                    <p><strong>Offre :</strong> {c.offer}</p>
                    <p><strong>Impact :</strong> {c.expectedLift}</p>
                    <p>{c.reason}</p>
                  </article>
                ))}
              </div>
              <p className="mkt-footer-link">
                <Link to="/admin/promotions">Promotions produits →</Link>
              </p>
            </>
          )}

          {tab === 'channels' && (
            <div className="mkt-grid-2">
              {(pack.channels || []).map((ch) => (
                <article key={ch.id} className="mkt-channel">
                  <div className="mkt-channel__head">
                    <strong>{ch.icon} {ch.name}</strong>
                    <span className={`mkt-badge mkt-badge--${ch.status}`}>{ch.status}</span>
                  </div>
                  {ch.sent != null && <p style={{ margin: '4px 0', fontSize: 13 }}>Envoyés : {fmt(ch.sent)}</p>}
                  {ch.openRate != null && <p style={{ margin: '4px 0', fontSize: 13 }}>Ouverture : {ch.openRate} %</p>}
                  <p style={{ margin: '4px 0', fontSize: 13 }}>Clics : {fmt(ch.clicks)} · Conv. : {fmt(ch.conversions)}</p>
                </article>
              ))}
            </div>
          )}

          {tab === 'social' && (
            <div className="mkt-grid-2">
              <div className="mkt-panel">
                <h3><Share2 size={18} style={{ verticalAlign: 'middle' }} /> Calendrier social</h3>
                {(pack.socialCalendar || []).map((post) => (
                  <div key={post.id} className="mkt-social-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{post.platform}</strong>
                      <span className={`mkt-badge mkt-badge--${post.status === 'published' ? 'active' : post.status === 'draft' ? 'pending' : 'connected'}`}>
                        {post.status}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0', fontSize: 13 }}>{post.content}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{fmtDt(post.scheduledAt)}</p>
                  </div>
                ))}
              </div>

              <div className="mkt-panel">
                <h3><Search size={18} style={{ verticalAlign: 'middle' }} /> SEO</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                  <div className="mkt-seo-score">{pack.seo?.score}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    <div>{pack.seo?.pagesIndexed} pages indexées</div>
                    <div>Position moy. : {pack.seo?.avgPosition}</div>
                  </div>
                </div>
                <table className="mkt-keywords">
                  <thead>
                    <tr>
                      <th>Mot-clé</th>
                      <th>Pos.</th>
                      <th>Volume</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pack.seo?.keywords || []).map((kw) => (
                      <tr key={kw.term}>
                        <td>{kw.term}</td>
                        <td>{kw.position}</td>
                        <td>{fmt(kw.volume)}</td>
                        <td>{kw.trend === 'up' ? '↑' : kw.trend === 'down' ? '↓' : '→'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'newsletter' && (
            <>
              <div className="mkt-kpi-grid">
                <Kpi label="Abonnés" value={fmt(pack.newsletter?.total)} />
                <Kpi label="Croissance 7j" value={`+${pack.newsletter?.growth7d} %`} />
                <Kpi label="CA attribué" value={`${fmt(k.revenueAttributed)} DT`} />
              </div>
              <div className="mkt-panel">
                <h3>Dernières inscriptions</h3>
                {(pack.newsletter?.recent || []).length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>
                    Aucune inscription locale. Les visiteurs peuvent s&apos;inscrire sur la page d&apos;accueil.
                  </p>
                ) : (
                  <ul className="mkt-newsletter-list">
                    {pack.newsletter.recent.map((s) => (
                      <li key={s.id || s.email}>
                        <strong>{s.email}</strong>
                        {s.name ? ` — ${s.name}` : ''}
                        <span style={{ color: '#94a3b8', marginLeft: 8 }}>{fmtDt(s.subscribedAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mkt-footer-link">
                  <a href="/" target="_blank" rel="noopener noreferrer">Voir le formulaire sur la landing →</a>
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const Kpi = ({ label, value }) => (
  <div className="mkt-kpi">
    <div className="mkt-kpi__label">{label}</div>
    <div className="mkt-kpi__value">{value ?? '—'}</div>
  </div>
);

export default AdminDigitalMarketingPage;
