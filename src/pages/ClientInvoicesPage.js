import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import InvoicePayModal from '../components/InvoicePayModal';
import { getPaymentLabel } from '../constants/paymentMethods';
import { downloadInvoicePdf } from '../utils/invoicePdf';

const ClientInvoicesPage = () => {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [orderIdFromUrl]);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      const list = res.data || [];
      setInvoices(list);
      if (orderIdFromUrl) {
        const match = list.find(
          (inv) =>
            inv.orderId?._id === orderIdFromUrl ||
            inv.orderId === orderIdFromUrl ||
            inv.orderId?.id === orderIdFromUrl
        );
        if (match && match.status !== 'paid') setSelectedInvoice(match);
      }
    } catch (error) {
      console.error('Error fetching invoices', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (invoice) => downloadInvoicePdf(invoice);

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
                  {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Non payée'}
                </span>
              </div>

              <div style={infoGridStyle}>
                <div><strong>Montant</strong><p>{invoice.amount} DT</p></div>
                <div><strong>Emission</strong><p>{new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}</p></div>
                <div><strong>Methode</strong><p>{getPaymentLabel(invoice.paymentMethod)}</p></div>
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
                  <button style={pdfButtonStyle} onClick={() => downloadPDF(invoice)} title="Télécharger PDF">
                    📄 Exporter PDF
                  </button>
                  {invoice.status !== 'paid' ? (
                    <button style={payButtonStyle} onClick={() => setSelectedInvoice(invoice)}>
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
        <InvoicePayModal
          invoice={selectedInvoice}
          onCancel={() => setSelectedInvoice(null)}
          onSuccess={() => {
            setSelectedInvoice(null);
            fetchInvoices();
            window.alert('Facture payée avec succès');
          }}
        />
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

const paidLabelStyle = {
  color: '#166534',
  fontWeight: 'bold',
};

export default ClientInvoicesPage;
