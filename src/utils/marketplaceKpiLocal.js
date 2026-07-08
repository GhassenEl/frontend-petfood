/**
 * Fallback local KPI marketplace (mode hors-ligne) — miroir léger du backend.
 */
import kpiData from '../data/marketplaceKpiSummary.json';

const fmt = (n) => Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const KPI_INTENT =
  /kpi|marketplace|wished|souhait|vente|vendu|note moyenne|etoile|étoile|répartition|repartition|moyenne|top ventes|top souhaits|sans vente|catégorie|categorie/i;

export const detectLocalMarketplaceKpi = (message) => KPI_INTENT.test(String(message || ''));

export const getLocalMarketplaceKpiReply = (message, role = 'admin') => {
  if (!detectLocalMarketplaceKpi(message)) return null;
  const k = kpiData;
  const t = String(message || '').toLowerCase().trim();

  if (t === 'kpi marketplace' || /^kpi marketplace/.test(t)) {
    return {
      message:
        `**Synthèse marketplace (local)** — ${fmt(k.total_products)} produits | ` +
        `Ventes **${fmt(k.total_sold_units_est)}** | Souhaits **${fmt(k.total_wished)}** | ` +
        `Note **${k.avg_star_rated_only}/5** | Sans vente **${k.zero_sold_pct}%**.`,
      quickReplies: ['Top ventes', 'Top souhaits', 'Note moyenne', 'Répartition catégories'],
    };
  }
  if (t === 'top ventes' || /top.*vente|plus vendu/.test(t)) {
    const lines = (k.top_sold || []).slice(0, 5).map((p, i) => `${i + 1}. ${p.title} (~${fmt(p.sold)} ventes)`);
    return { message: `Top ventes :\n${lines.join('\n')}`, quickReplies: ['KPI marketplace', 'Top souhaits'] };
  }
  if (t === 'top souhaits' || /souhait|wished|populaire/.test(t)) {
    const lines = (k.top_wished || []).slice(0, 5).map((p) => `• ${p.title} — ${fmt(p.wished)} souhaits`);
    return { message: `Top souhaits :\n${lines.join('\n')}`, quickReplies: ['KPI marketplace', 'Top ventes'] };
  }
  if (t === 'note moyenne' || /note moyenne|moyenne.*note/.test(t)) {
    return {
      message: `Note moyenne : **${k.avg_star_all}/5** (notés : **${k.avg_star_rated_only}/5**).`,
      quickReplies: ['KPI marketplace', 'Top ventes'],
    };
  }
  if (/répartition|repartition|catégorie/.test(t)) {
    const lines = Object.entries(k.by_category || {})
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([name, c]) => `• ${name.replace(/_/g, ' ')} : ${c.count} (${c.share_pct}%)`);
    return { message: `Répartition :\n${lines.join('\n')}`, quickReplies: ['KPI marketplace'] };
  }
  if (/sans vente|0 sold/.test(t)) {
    return {
      message: `**${k.zero_sold_pct}%** sans vente (${fmt(k.zero_sold_count)} références).`,
      quickReplies: ['KPI marketplace', 'Top ventes'],
    };
  }
  if (role === 'vendor' && /kpi|benchmark|jouet/.test(t)) {
    const j = k.by_category?.jouets;
    return {
      message: j
        ? `Benchmark jouets : ${j.count} SKU, note ${j.avg_star}/5, ${fmt(j.total_sold_est)} ventes est.`
        : 'Données catégorie indisponibles.',
      quickReplies: ['KPI marketplace', 'Mes produits'],
    };
  }
  return {
    message:
      `Marketplace : ${fmt(k.total_products)} produits, ${fmt(k.total_sold_units_est)} ventes est., ` +
      `note ${k.avg_star_rated_only}/5. Demandez « top ventes », « top souhaits », « répartition catégories ».`,
    quickReplies: ['Top ventes', 'Top souhaits', 'KPI marketplace'],
  };
};

export default getLocalMarketplaceKpiReply;
