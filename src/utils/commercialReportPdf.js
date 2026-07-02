import { jsPDF } from 'jspdf';
import { formatDT } from './formatCurrency';

const COMPANY = {
  name: 'PetfoodTN',
  tagline: 'Rapport commercial',
};

const addHeader = (doc, title, subtitle) => {
  doc.setFontSize(18);
  doc.setTextColor(230, 126, 34);
  doc.text(COMPANY.name, 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(COMPANY.tagline, 14, 26);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 38);
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 46);
  }
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 52, 196, 52);
};

const addKpiRow = (doc, y, label, value) => {
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(label, 14, y);
  doc.setTextColor(15, 23, 42);
  doc.text(String(value), 100, y);
};

/**
 * Export rapport commercial admin (PDF).
 */
export function downloadAdminCommercialReport(pack) {
  const doc = new jsPDF();
  const k = pack?.kpis || {};
  const date = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });

  addHeader(doc, 'Rapport commercial — Administration', `Généré le ${date}`);

  let y = 62;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Indicateurs clés', 14, y);
  y += 10;

  [
    ['CA mensuel', formatDT(k.revenueMonth)],
    ['Commandes', String(k.ordersWeek ?? '—')],
    ['Taux conversion', `${k.conversionRate ?? '—'} %`],
    ['ROAS publicité', `${k.adRoas ?? '—'}x`],
    ['Vendeurs actifs', String(k.activeVendors ?? '—')],
    ['Abonnés newsletter', String(k.newsletterSubs ?? '—')],
    ['CA attribué marketing', formatDT(k.revenueAttributed)],
  ].forEach(([label, val]) => {
    addKpiRow(doc, y, label, val);
    y += 8;
  });

  y += 6;
  doc.setFontSize(12);
  doc.text('Commissions vendeurs (aperçu)', 14, y);
  y += 8;
  doc.setFontSize(9);
  (pack?.vendorCommissions || []).slice(0, 8).forEach((v) => {
    doc.text(
      `${v.shopName} — payé: ${formatDT(v.commissionsPaid)} · en attente: ${formatDT(v.commissionsPending)}`,
      14,
      y,
    );
    y += 7;
    if (y > 270) return;
  });

  y += 6;
  if (y < 250) {
    doc.setFontSize(12);
    doc.text('Codes promo actifs', 14, y);
    y += 8;
    doc.setFontSize(9);
    (pack?.promotions || []).filter((p) => p.active).slice(0, 5).forEach((p) => {
      doc.text(`${p.code} — ${p.label} (${p.usedCount}/${p.maxUses} utilisations)`, 14, y);
      y += 7;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Document généré par PetfoodTN — usage interne', 14, 285);

  doc.save(`petfoodtn-rapport-commercial-${Date.now()}.pdf`);
}

/**
 * Export rapport ventes vendeur (PDF).
 */
export function downloadVendorCommercialReport(pack) {
  const doc = new jsPDF();
  const k = pack?.kpis || {};
  const date = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });

  addHeader(doc, 'Rapport commercial — Vendeur', `Généré le ${date}`);

  let y = 62;
  doc.setFontSize(12);
  doc.text('Performance boutique', 14, y);
  y += 10;

  [
    ['Chiffre d\'affaires', formatDT(k.revenueTotal)],
    ['Commissions plateforme', formatDT(k.commissionTotal)],
    ['Commandes', String(k.ordersCount ?? '—')],
    ['Panier moyen', formatDT(k.avgBasket)],
    ['Rang marketplace', `#${k.rank ?? '—'}`],
  ].forEach(([label, val]) => {
    addKpiRow(doc, y, label, val);
    y += 8;
  });

  y += 8;
  doc.setFontSize(12);
  doc.text('Dernières ventes', 14, y);
  y += 8;
  doc.setFontSize(9);
  (pack?.recentSales || []).forEach((row) => {
    const d = row.date ? new Date(row.date).toLocaleDateString('fr-FR') : '—';
    doc.text(
      `${d} · ${row.orderId || row.id || '—'} · ${formatDT(row.total)} · comm. ${formatDT(row.commission || (row.total || 0) * 0.12)}`,
      14,
      y,
    );
    y += 7;
  });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('PetfoodTN Marketplace — commission standard 12 %', 14, 285);

  doc.save(`petfoodtn-rapport-vendeur-${Date.now()}.pdf`);
}

export function downloadCommercialReport(pack, role = 'admin') {
  if (role === 'vendor') downloadVendorCommercialReport(pack);
  else downloadAdminCommercialReport(pack);
}
