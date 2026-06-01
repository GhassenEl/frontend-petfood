import { jsPDF } from 'jspdf';
import { getPaymentLabel } from '../constants/paymentMethods';
import { formatDT } from './formatCurrency';

const COMPANY = {
  name: 'PetfoodTN',
  tagline: 'Alimentation & soins pour animaux',
  address: 'Lac 1, Tunis 1053, Tunisie',
  email: 'contact@petfood.tn',
  phone: '+216 71 000 000',
};

const STATUS_LABELS = {
  paid: 'Payée',
  unpaid: 'Non payée',
  pending: 'En attente',
};

export const getInvoiceId = (invoice) => invoice?._id || invoice?.id || '';

export const getInvoiceShortId = (invoice) => {
  const id = getInvoiceId(invoice);
  return id ? id.slice(-8).toUpperCase() : 'N/A';
};

const resolveItems = (invoice) => {
  const order = invoice?.orderId;
  if (!order) return [];
  const items = order.items || [];
  return items.map((item) => {
    const name =
      item.productId?.name ||
      item.product?.name ||
      item.name ||
      (typeof item.productId === 'string' ? `Produit ${item.productId.slice(-6)}` : 'Produit');
    const qty = Number(item.quantity) || 1;
    const unit = Number(item.price) || 0;
    return { name, qty, unit, lineTotal: unit * qty };
  });
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

/**
 * Génère et télécharge une facture PDF (client ou admin).
 */
export const downloadInvoicePdf = (invoice, options = {}) => {
  if (!invoice) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 0;

  // Bandeau en-tête
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY.name, margin, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY.tagline, margin, 21);
  doc.text('FACTURE', pageW - margin, 16, { align: 'right' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${getInvoiceShortId(invoice)}`, pageW - margin, 23, { align: 'right' });

  y = 42;
  doc.setTextColor(30, 41, 59);

  // Infos facture + client
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(`Date d'émission : ${formatDate(invoice.issuedAt || invoice.createdAt)}`, margin, y);
  y += 5;
  const status = STATUS_LABELS[invoice.status] || invoice.status || '—';
  doc.text(`Statut : ${status}`, margin, y);
  y += 5;
  doc.text(`Paiement : ${getPaymentLabel(invoice.paymentMethod)}`, margin, y);

  const orderId = invoice.orderId?._id || invoice.orderId?.id || invoice.orderId;
  const clientName = invoice.userId?.name || options.clientName || '—';
  const clientEmail = invoice.userId?.email || options.clientEmail || '—';

  const rightX = pageW / 2 + 5;
  let yRight = 42;
  doc.setFont('helvetica', 'bold');
  doc.text('Client', rightX, yRight);
  doc.setFont('helvetica', 'normal');
  yRight += 6;
  doc.text(String(clientName), rightX, yRight);
  yRight += 5;
  doc.text(String(clientEmail), rightX, yRight);
  yRight += 5;
  if (orderId) {
    doc.text(`Commande #${String(orderId).slice(-8).toUpperCase()}`, rightX, yRight);
  }

  y = Math.max(y, yRight) + 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Tableau lignes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y - 5, pageW - 2 * margin, 8, 'F');
  doc.text('Article', margin + 2, y);
  doc.text('Qté', pageW - margin - 55, y, { align: 'right' });
  doc.text('P.U.', pageW - margin - 35, y, { align: 'right' });
  doc.text('Total', pageW - margin - 2, y, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const items = resolveItems(invoice);

  if (items.length === 0) {
    doc.text('Détail non disponible — montant global facturé', margin + 2, y + 4);
    y += 12;
  } else {
    items.forEach((line) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      const nameLines = doc.splitTextToSize(line.name, pageW - margin * 2 - 70);
      doc.text(nameLines, margin + 2, y);
      doc.text(String(line.qty), pageW - margin - 55, y, { align: 'right' });
      doc.text(formatDT(line.unit, { decimals: 2 }), pageW - margin - 35, y, { align: 'right' });
      doc.text(formatDT(line.lineTotal, { decimals: 2 }), pageW - margin - 2, y, { align: 'right' });
      y += Math.max(6, nameLines.length * 5);
    });
  }

  y += 4;
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  const amount = Number(invoice.amount) || items.reduce((s, i) => s + i.lineTotal, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total TTC', pageW - margin - 60, y);
  doc.setTextColor(5, 150, 105);
  doc.text(formatDT(amount, { decimals: 2 }), pageW - margin - 2, y, { align: 'right' });
  doc.setTextColor(30, 41, 59);

  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const footer = [
    `${COMPANY.name} — ${COMPANY.address}`,
    `${COMPANY.email} · ${COMPANY.phone}`,
    'Merci pour votre confiance.',
  ];
  if (invoice.status !== 'paid') {
    footer.splice(2, 0, 'Facture non réglée — merci de procéder au paiement selon la méthode choisie.');
  }
  footer.forEach((line) => {
    doc.text(line, pageW / 2, y, { align: 'center' });
    y += 4;
  });

  doc.save(`facture_${getInvoiceShortId(invoice)}.pdf`);
};

/**
 * Exporte plusieurs factures en fichiers PDF séparés (admin).
 */
export const downloadInvoicesPdfBatch = (invoices) => {
  if (!invoices?.length) return;
  invoices.forEach((inv, i) => {
    setTimeout(() => downloadInvoicePdf(inv), i * 350);
  });
};
