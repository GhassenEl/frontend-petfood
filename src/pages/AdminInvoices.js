import React, { useEffect, useState } from 'react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import api from '../utils/api';
import { DEMO_ADMIN_INVOICES, withDemoFallback } from '../utils/adminDemoData';
import { PAYMENT_METHODS, getPaymentLabel } from '../constants/paymentMethods';
import { downloadInvoicePdf, downloadInvoicesPdfBatch } from '../utils/invoicePdf';

const emptyForm = {
  userId: '',
  orderId: '',
  amount: '',
  status: 'unpaid',
  paymentMethod: 'cash',
};

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchInvoices();
    fetchUsers();
    fetchOrders();
  }, []);

  usePlatformRefresh(() => {
    fetchInvoices();
    fetchUsers();
    fetchOrders();
  });

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices/all');
      setInvoices(withDemoFallback(res.data || [], DEMO_ADMIN_INVOICES));
    } catch (error) {
      console.error('Erreur chargement factures', error);
      setInvoices(DEMO_ADMIN_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Users load error', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (error) {
      console.error('Orders load error', error);
    }
  };

  const openCreate = () => {
    setEditingInvoice(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      userId: invoice.user?.id || invoice.user?._id || invoice.userId || '',
      orderId: invoice.order?.id || invoice.order?._id || invoice.orderId || '',
      amount: invoice.amount || '',
      status: invoice.status || 'unpaid',
      paymentMethod: invoice.paymentMethod || 'cash',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };
      if (editingInvoice) {
        await api.put(`/invoices/${editingInvoice._id}`, payload);
      } else {
        await api.post('/invoices', payload);
      }
      closeModal();
      fetchInvoices();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement facture');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette facture ?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression facture');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/invoices/${id}`, { status });
      fetchInvoices();
    } catch (error) {
      window.alert('Erreur mise à jour statut');
    }
  };

  const filteredInvoices = invoices.filter((inv) =>
    `${inv.user?.name || inv.userId?.name || ''} ${inv.user?.email || inv.userId?.email || ''} ${inv._id || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🧾 Gestion des factures</h1>
          <p style={styles.subtitle}>{invoices.length} facture(s)</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {filteredInvoices.length > 0 && (
            <button
              type="button"
              style={styles.pdfBatchBtn}
              onClick={() => downloadInvoicesPdfBatch(filteredInvoices)}
              title="Télécharger toutes les factures filtrées"
            >
              📄 Exporter tout (PDF)
            </button>
          )}
          <button style={styles.addBtn} onClick={openCreate}>➕ Ajouter une facture</button>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher une facture..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchCount}>{filteredInvoices.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>N° Facture</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Montant</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Paiement</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv, idx) => (
              <tr key={inv.id || inv._id} style={styles.tr}>
                <td style={styles.td}><strong>#{String(inv.id || inv._id).substring(0, 8).toUpperCase()}</strong></td>
                <td style={styles.td}>{inv.user?.name || inv.userId?.name || 'Inconnu'}</td>
                <td style={styles.td}>{inv.user?.email || inv.userId?.email || 'N/A'}</td>
                <td style={styles.td}>
                  <strong style={{ color: '#059669', fontSize: '16px' }}>{inv.amount} TND</strong>
                </td>
                <td style={styles.td}>
                  <select
                    value={inv.status}
                    onChange={(e) => updateStatus(inv.id || inv._id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="paid">✅ Payée</option>
                    <option value="unpaid">❌ Non payée</option>
                    <option value="pending">⏳ En attente</option>
                  </select>
                </td>
                <td style={styles.td}>{getPaymentLabel(inv.paymentMethod)}</td>
                <td style={styles.td}>{new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('fr-TN')}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      style={styles.pdfBtn}
                      onClick={() => downloadInvoicePdf(inv)}
                      title="Exporter PDF"
                    >
                      📄
                    </button>
                    <button style={styles.editBtn} onClick={() => openEdit(inv)} title="Modifier">✏️</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(inv.id || inv._id)} title="Supprimer">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInvoices.length === 0 && (
          <p style={styles.empty}>Aucune facture trouvée</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingInvoice ? '✏️ Modifier la facture' : '➕ Nouvelle facture'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                style={styles.input}
              >
                <option value="">Choisir un client</option>
                {users.map((u) => (
                  <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <select
                required
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                style={styles.input}
              >
                <option value="">Choisir une commande</option>
                {orders.map((o) => (
                  <option key={o.id || o._id} value={o.id || o._id}>{String(o.id || o._id).substring(0, 8)} — {o.total} DT</option>
                ))}
              </select>
              <div style={styles.row2}>
                <input required type="number" step="0.01" placeholder="Montant (TND)" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} style={styles.input} />
                <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} style={styles.input}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>
                  ))}
                </select>
              </div>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={styles.input}>
                <option value="unpaid">❌ Non payée</option>
                <option value="pending">⏳ En attente</option>
                <option value="paid">✅ Payée</option>
              </select>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingInvoice ? '💾 Enregistrer' : '✅ Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#065f46', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' },
  addBtn: { padding: '12px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'transform 0.2s' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  searchCount: { fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' },
  tableWrapper: { background: 'white', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', borderBottom: '2px solid #f3f4f6', fontWeight: '700', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' },
  select: { padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', background: 'white', cursor: 'pointer' },
  editBtn: { padding: '6px 10px', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  pdfBtn: { padding: '6px 10px', background: '#dbeafe', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  pdfBatchBtn: { padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 10px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  empty: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'white', borderRadius: '20px', padding: '28px', width: '520px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#111827' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: { padding: '10px 18px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#4b5563' },
  saveBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
};

export default AdminInvoices;

