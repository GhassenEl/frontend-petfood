import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, RefreshCw, TrendingUp, Tag, Percent, Mail, FileDown, Megaphone,
} from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { fetchCommercialPack } from '../services/commercialPackService';
import {
  ADMIN_COMMERCIAL_MODULES,
  VENDOR_COMMERCIAL_MODULES,
} from '../config/commercialCatalog';
import { downloadCommercialReport } from '../utils/commercialReportPdf';
import { formatDT } from '../utils/formatCurrency';
import './CommercialHubPage.css';

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDt = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

const ADMIN_TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Briefcase },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'commissions', label: 'Commissions', icon: Percent },
  { id: 'email', label: 'Campagnes email', icon: Mail },
  { id: 'reports', label: 'Rapports PDF', icon: FileDown },
];

const VENDOR_TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Briefcase },
  { id: 'commissions', label: 'Commissions', icon: Percent },
  { id: 'promotions', label: 'Promos boutique', icon: Tag },
  { id: 'reports', label: 'Rapport PDF', icon: FileDown },
];

const statusBadge = (status) => {
  const map = {
    sent: { label: 'Envoyée', cls: 'ok' },
    scheduled: { label: 'Planifiée', cls: 'pending' },
    active: { label: 'Active', cls: 'ok' },
    paid: { label: 'Payée', cls: 'ok' },
    pending: { label: 'En attente', cls: 'pending' },
    active_vendor: { label: 'Actif', cls: 'ok' },
  };
  const s = map[status] || { label: status, cls: 'neutral' };
  return <span className={`commercial-hub__status commercial-hub__status--${s.cls}`}>{s.label}</span>;
};

const CommercialHubPage = ({ role = 'admin' }) => {
  const isVendor = role === 'vendor';
  const tabs = isVendor ? VENDOR_TABS : ADMIN_TABS;
  const modules = isVendor ? VENDOR_COMMERCIAL_MODULES : ADMIN_COMMERCIAL_MODULES;
  const [tab, setTab] = useState('overview');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await fetchCommercialPack(role));
    } catch {
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const k = pack?.kpis || {};

  const exportPdf = () => {
    if (!pack) return;
    downloadCommercialReport(pack, role);
  };

  return (
    <div className={`commercial-hub${isVendor ? ' commercial-hub--vendor' : ''}`}>
      <header className="commercial-hub__hero">
        <h1>
          <Briefcase size={28} aria-hidden />
          {isVendor ? 'Espace commercial vendeur' : 'Hub commercial PetfoodTN'}
        </h1>
        <p>
          {isVendor
            ? 'Ventes, commissions, promotions boutique et rapports — pilotage commercial complet.'
            : 'Promotions, commissions marketplace, campagnes email et exports PDF — tout en un lieu.'}
        </p>
        {pack?.mode === 'demo' && (
          <span className="commercial-hub__badge">Mode démo — données illustratives</span>
        )}
      </header>

      <div className="commercial-hub__tabs" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`commercial-hub__tab${tab === id ? ' commercial-hub__tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} aria-hidden /> {label}
          </button>
        ))}
      </div>

      <div className="commercial-hub__toolbar">
        <button type="button" className="commercial-hub__btn" onClick={load} disabled={loading}>
          <RefreshCw size={15} aria-hidden /> Actualiser
        </button>
        {(tab === 'reports' || tab === 'overview') && (
          <button type="button" className="commercial-hub__btn commercial-hub__btn--primary" onClick={exportPdf}>
            <FileDown size={15} aria-hidden /> Exporter PDF
          </button>
        )}
      </div>

      {loading && !pack ? (
        <p style={{ color: '#94a3b8' }}>Chargement commercial…</p>
      ) : (
        <>
          {(tab === 'overview' || tab === 'reports') && (
            <div className="commercial-hub__kpi-grid">
              {isVendor ? (
                <>
                  <div className="commercial-hub__kpi"><span>CA total</span><strong>{formatDT(k.revenueTotal)}</strong><small>{k.ordersCount} commande(s)</small></div>
                  <div className="commercial-hub__kpi"><span>Commissions payées</span><strong>{formatDT(k.commissionTotal)}</strong><small>Taux {Math.round((k.commissionRate || 0.12) * 100)} %</small></div>
                  <div className="commercial-hub__kpi"><span>En attente</span><strong>{formatDT(k.commissionPending)}</strong></div>
                  <div className="commercial-hub__kpi"><span>Panier moyen</span><strong>{formatDT(k.avgBasket)}</strong></div>
                  <div className="commercial-hub__kpi"><span>Promos actives</span><strong>{k.promoCount ?? 0}</strong></div>
                  <div className="commercial-hub__kpi"><span>Rang marketplace</span><strong>#{k.rank}</strong></div>
                </>
              ) : (
                <>
                  <div className="commercial-hub__kpi"><span>CA mensuel</span><strong>{formatDT(k.revenueMonth)}</strong></div>
                  <div className="commercial-hub__kpi"><span>Commandes</span><strong>{fmt(k.ordersWeek)}</strong></div>
                  <div className="commercial-hub__kpi"><span>Commissions payées</span><strong>{formatDT(k.commissionsPaid)}</strong></div>
                  <div className="commercial-hub__kpi"><span>Commissions en attente</span><strong>{formatDT(k.commissionsPending)}</strong></div>
                  <div className="commercial-hub__kpi"><span>Coupons actifs</span><strong>{k.activeCoupons}</strong></div>
                  <div className="commercial-hub__kpi"><span>Newsletter</span><strong>{fmt(k.newsletterSubs)}</strong></div>
                  <div className="commercial-hub__kpi"><span>ROAS</span><strong>{k.adRoas}x</strong></div>
                  <div className="commercial-hub__kpi"><span>Conversion</span><strong>{k.conversionRate} %</strong></div>
                </>
              )}
            </div>
          )}

          {tab === 'overview' && (
            <>
              <h2 className="commercial-hub__section-title">Modules commerciaux</h2>
              <div className="commercial-hub__modules">
                {modules.map((m) => (
                  <Link key={m.id} to={`${m.route}${m.hash || ''}`} className="commercial-hub__module" style={{ '--mod-color': m.color }}>
                    <div className="commercial-hub__module-icon">{m.icon}</div>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <span className="commercial-hub__module-cta">Ouvrir →</span>
                  </Link>
                ))}
              </div>
              {!isVendor && pack?.funnel?.length > 0 && (
                <div className="commercial-hub__panel">
                  <h2 className="commercial-hub__section-title"><TrendingUp size={18} /> Entonnoir commercial</h2>
                  <div className="commercial-hub__funnel">
                    {pack.funnel.map((step) => (
                      <div key={step.stage} className="commercial-hub__funnel-step">
                        <strong>{fmt(step.count)}</strong>
                        <span>{step.stage}</span>
                        <small style={{ color: '#94a3b8' }}>{step.pct} %</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'promotions' && !isVendor && (
            <div className="commercial-hub__panel">
              <div className="commercial-hub__panel-head">
                <h2><Tag size={18} /> Codes promo & coupons</h2>
                <Link to="/admin/promotions" className="commercial-hub__link-btn">Gérer les promotions →</Link>
              </div>
              <table className="commercial-hub__table">
                <thead>
                  <tr><th>Code</th><th>Libellé</th><th>Type</th><th>Valeur</th><th>Utilisations</th><th>Expiration</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {(pack?.promotions || []).map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.code}</strong></td>
                      <td>{p.label}</td>
                      <td>{p.type === 'percent' ? '%' : 'Fixe'}</td>
                      <td>{p.type === 'percent' ? `${p.value} %` : formatDT(p.value)}</td>
                      <td>{p.usedCount}/{p.maxUses}</td>
                      <td>{p.expiresAt}</td>
                      <td>{p.active ? statusBadge('active') : statusBadge('pending')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="commercial-hub__hint">Remises auto IA et promotions produits : <Link to="/admin/promotions">page Promotions complète</Link></p>
            </div>
          )}

          {tab === 'promotions' && isVendor && (
            <div className="commercial-hub__panel">
              <div className="commercial-hub__panel-head">
                <h2><Tag size={18} /> Promotions catalogue</h2>
                <Link to="/vendor/products" className="commercial-hub__link-btn">Modifier produits →</Link>
              </div>
              {(pack?.promoProducts || []).length === 0 ? (
                <p className="commercial-hub__hint">Aucune promotion active — ajoutez un % promo sur vos produits.</p>
              ) : (
                <table className="commercial-hub__table">
                  <thead><tr><th>Produit</th><th>Prix</th><th>Promo</th><th>Prix promo</th><th>Stock</th></tr></thead>
                  <tbody>
                    {pack.promoProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{formatDT(p.price)}</td>
                        <td>-{p.promotionPercent}%</td>
                        <td>{formatDT(p.price * (1 - p.promotionPercent / 100), { decimals: 2 })}</td>
                        <td>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'commissions' && (
            <div className="commercial-hub__panel">
              <div className="commercial-hub__panel-head">
                <h2><Percent size={18} /> {isVendor ? 'Mes commissions' : 'Commissions vendeurs marketplace'}</h2>
                <Link to={isVendor ? '/vendor/sales' : '/admin/vendors'} className="commercial-hub__link-btn">
                  {isVendor ? 'Historique ventes →' : 'Gestion vendeurs →'}
                </Link>
              </div>
              {!isVendor ? (
                <table className="commercial-hub__table">
                  <thead>
                    <tr><th>Boutique</th><th>Région</th><th>CA 30j</th><th>Payé</th><th>En attente</th><th>Taux</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {(pack?.vendorCommissions || []).map((v) => (
                      <tr key={v.id}>
                        <td><strong>{v.shopName}</strong></td>
                        <td>{v.region}</td>
                        <td>{formatDT(v.revenue30d)}</td>
                        <td>{formatDT(v.commissionsPaid)}</td>
                        <td>{formatDT(v.commissionsPending)}</td>
                        <td>{Math.round((v.commissionRate || 0.12) * 100)} %</td>
                        <td>{statusBadge(v.status === 'active' ? 'active_vendor' : v.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <div className="commercial-hub__commission-summary">
                    <div><span>Total commissions</span><strong>{formatDT(k.commissionTotal)}</strong></div>
                    <div><span>En attente de virement</span><strong>{formatDT(k.commissionPending)}</strong></div>
                    <div><span>Taux plateforme</span><strong>{Math.round((k.commissionRate || 0.12) * 100)} %</strong></div>
                  </div>
                  <table className="commercial-hub__table">
                    <thead><tr><th>Période</th><th>Montant</th><th>Statut</th><th>Date paiement</th></tr></thead>
                    <tbody>
                      {(pack?.commissionSchedule || []).map((row) => (
                        <tr key={row.id}>
                          <td>{row.period}</td>
                          <td>{formatDT(row.amount)}</td>
                          <td>{statusBadge(row.status)}</td>
                          <td>{row.paidAt ? new Date(row.paidAt).toLocaleDateString('fr-FR') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pack?.recentSales?.length > 0 && (
                    <>
                      <h3 className="commercial-hub__sub-title">Détail par vente</h3>
                      <table className="commercial-hub__table">
                        <thead><tr><th>Date</th><th>Commande</th><th>CA</th><th>Commission</th></tr></thead>
                        <tbody>
                          {pack.recentSales.map((row) => (
                            <tr key={row.id || row.orderId}>
                              <td>{row.date ? new Date(row.date).toLocaleDateString('fr-FR') : '—'}</td>
                              <td>{row.orderId || row.id}</td>
                              <td>{formatDT(row.total)}</td>
                              <td>{formatDT(row.commission || (row.total || 0) * 0.12)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'email' && !isVendor && (
            <>
              <div className="commercial-hub__kpi-grid commercial-hub__kpi-grid--compact">
                <div className="commercial-hub__kpi"><span>Abonnés</span><strong>{fmt(pack?.newsletter?.total)}</strong></div>
                <div className="commercial-hub__kpi"><span>Croissance 7j</span><strong>+{pack?.newsletter?.growth7d ?? 4.2} %</strong></div>
                <div className="commercial-hub__kpi"><span>Ouverture email</span><strong>{pack?.marketing?.kpis?.emailOpenRate ?? 38.4} %</strong></div>
              </div>
              <div className="commercial-hub__panel">
                <div className="commercial-hub__panel-head">
                  <h2><Mail size={18} /> Campagnes email</h2>
                  <Link to="/admin/digital-marketing" className="commercial-hub__link-btn">Marketing digital →</Link>
                </div>
                <table className="commercial-hub__table">
                  <thead>
                    <tr><th>Campagne</th><th>Objet</th><th>Envoyés</th><th>Ouverture</th><th>Clics</th><th>Conv.</th><th>Planifiée</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {(pack?.emailCampaigns || []).map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td style={{ maxWidth: 200 }}>{c.subject}</td>
                        <td>{fmt(c.sent)}</td>
                        <td>{c.openRate ? `${c.openRate} %` : '—'}</td>
                        <td>{fmt(c.clicks)}</td>
                        <td>{fmt(c.conversions)}</td>
                        <td>{fmtDt(c.scheduledAt)}</td>
                        <td>{statusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(pack?.aiCampaigns || []).length > 0 && (
                <div className="commercial-hub__panel">
                  <h2 className="commercial-hub__section-title"><Megaphone size={18} /> Recommandations campagnes IA</h2>
                  <div className="commercial-hub__campaign-grid">
                    {pack.aiCampaigns.slice(0, 4).map((c) => (
                      <article key={c.id || c.title} className="commercial-hub__campaign-card">
                        <h3>{c.title}</h3>
                        <p><strong>Cible :</strong> {c.target}</p>
                        <p><strong>Canal :</strong> {c.channel}</p>
                        <p><strong>Offre :</strong> {c.offer}</p>
                        <p style={{ color: '#64748b', fontSize: '0.82rem' }}>{c.reason}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'reports' && (
            <div className="commercial-hub__panel commercial-hub__panel--reports">
              <h2><FileDown size={18} /> Rapport commercial PDF</h2>
              <p>
                Exportez un résumé {isVendor ? 'de vos ventes et commissions' : 'CA, commissions vendeurs, codes promo et KPIs marketing'} au format PDF.
              </p>
              <button type="button" className="commercial-hub__btn commercial-hub__btn--primary commercial-hub__btn--lg" onClick={exportPdf}>
                <FileDown size={18} /> Télécharger le rapport PDF
              </button>
              <ul className="commercial-hub__report-list">
                <li>Indicateurs clés et période de génération</li>
                {isVendor ? (
                  <>
                    <li>Détail des dernières ventes et commissions</li>
                    <li>Taux marketplace 12 %</li>
                  </>
                ) : (
                  <>
                    <li>Commissions par vendeur (payé / en attente)</li>
                    <li>Codes promotionnels actifs</li>
                    <li>Métriques marketing synthétiques</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommercialHubPage;
