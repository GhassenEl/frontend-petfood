/** Export CSV des factures client. */

const escapeCsv = (v) => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadInvoicesCsv(invoices = [], filename = 'factures-petfoodtn.csv') {
  const headers = ['ID', 'Montant (DT)', 'Statut', 'Date émission', 'Méthode paiement', 'Commande', 'Articles'];
  const rows = invoices.map((inv) => [
    inv.id || inv._id,
    inv.amount,
    inv.status,
    inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString('fr-FR') : '',
    inv.paymentMethod || '',
    inv.order?.id || inv.order?._id || '',
    inv.order?.items?.length || 0,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default { downloadInvoicesCsv };
