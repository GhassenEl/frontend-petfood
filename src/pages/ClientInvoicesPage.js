import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { jsPDF } from 'jspdf';

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Especes' },
  { value: 'check', label: 'Cheque' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'transfer', label: 'Virement' },
];

const ClientInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedInvoice) return;
    try {
      await api.post(`/invoices/${selectedInvoice._id}/pay`, { paymentMethod });
      setSelectedInvoice(null);
      fetchInvoices();
      window.alert('Facture payee avec succes');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur lors du paiement');
    }
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('PetfoodTN - Facture', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Facture #${invoice._id.slice(-6)}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}`, 20, 50);
    doc.text(`Statut: ${invoice.status === 'paid' ? 'Payee' : 'Non payee'}`, 20, 60);
    doc.text(`Methode: ${invoice.paymentMethod || 'A definir'}`, 20, 70);
    doc.line(20, 80, 190, 80);
    doc.setFontSize(14);
    doc.text('Articles:', 20, 95);
    let y = 105;
    (invoice.orderId?.items || []).forEach((item, index) => {
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${item.productId?.name || 'Produit'} x ${item.quantity} - ${(item.price * item.quantity).toFixed(2)} DT`, 25, y);
      y += 10;
    });
    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: ${invoice.amount} DT`, 20, y + 20);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Merci pour votre confiance! - PetfoodTN', 105, 280, { align: 'center' });
    doc.save(`facture_${invoice._id.slice(-6)}.pdf`);
  };

  if (loading) return <div className="container p-8 text-center">Chargement...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={heroStyle}>
        <div>
          <h1 style={{ fontSize: '34px', marginTop: 0, marginBottom: '10px' }}>Mes Factures</h1>
          <p style={{ color: '#6b7280', marginBottom: 0 }}>
            Le client peut consulter sa facture et choisir sa methode de paiement.
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div style={emptyStyle}>Vous n'avez aucune facture pour le moment.</div>
      ) : (
        <div style={{ display: 'grid', gap: '18px' }}>
          {invoices.map((invoice) => (
            <article key={invoice._id} style={invoiceCardStyle}>
              <div style={invoiceHeadStyle}>
                <div>
                  <small style={{ color: '#6b7280' }}>Facture #{invoice._id.slice(-6)}</small>
                  <h3 style={{ margin: '6px 0' }}>{invoice.orderId?.items?.length || 0} article(s)</h3>
                </div>
                <span style={{ ...statusBadgeStyle, backgroundColor: invoice.status === 'paid' ? '#dcfce7' : '#fef3c7', color: invoice.status === 'paid' ? '#166534' : '#92400e' }}>
                  {invoice.status === 'paid' ? 'Payee' : 'Non payee'}
                </span>
              </div>

              <div style={infoGridStyle}>
                <div><strong>Montant</strong><p>{invoice.amount} DT</p></div>
                <div><strong>Emission</strong><p>{new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}</p></div>
                <div><strong>Methode</strong><p>{invoice.paymentMethod || 'A definir'}</p></div>
                <div><strong>Commande</strong><p>{invoice.orderId?._id?.slice(-6) || 'N/A'}</p></div>
              </div>

              <div style={{ marginTop: '16px' }}>
                {(invoice.orderId?.items || []).map((item, index) => (
                  <div key={`${invoice._id}-${index}`} style={lineItemStyle}>
                    <span>{item.productId?.name || 'Produit'} x {item.quantity}</span>
                    <strong>{(item.price * item.quantity).toFixed(2)} DT</strong>
                  </div>
                ))}
              </div>

              <div style={footerStyle}>
                <strong style={{ fontSize: '22px' }}>{invoice.amount} DT</strong>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button style={pdfButtonStyle} onClick={() => downloadPDF(invoice)}>
                    📄 PDF
                  </button>
                  {invoice.status !== 'paid' ? (
                    <button style={payButtonStyle} onClick={() => { setSelectedInvoice(invoice); setPaymentMethod(invoice.paymentMethod || 'cash'); }}>
                      Payer la facture
                    </button>
                  ) : (
                    <span style={paidLabelStyle}>Paiement confirme</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedInvoice && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>Choisir la methode de paiement</h3>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              {PAYMENT_OPTIONS.map((option) => (
                <label key={option.value} style={paymentOptionStyle}>
                  <input
                    type="radio"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={secondaryButtonStyle} onClick={() => setSelectedInvoice(null)}>Annuler</button>
              <button style={payButtonStyle} onClick={handlePay}>Confirmer le paiement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const heroStyle = {
  background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
  borderRadius: '18px',
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
};

const emptyStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '18px',
  color: '#6b7280',
};

const invoiceCardStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '22px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
};

const invoiceHeadStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const statusBadgeStyle = {
  padding: '8px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const infoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '12px',
  marginTop: '16px',
};

const lineItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 0',
  borderBottom: '1px solid #f3f4f6',
};

const footerStyle = {
  marginTop: '18px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const payButtonStyle = {
  padding: '12px 18px',
  background: '#16a34a',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const pdfButtonStyle = {
  padding: '12px 18px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  padding: '12px 18px',
  background: '#e5e7eb',
  color: '#111827',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const paidLabelStyle = {
  color: '#166534',
  fontWeight: 'bold',
};

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '24px',
  width: '420px',
  maxWidth: '100%',
};

const paymentOptionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
};

export default ClientInvoicesPage;
