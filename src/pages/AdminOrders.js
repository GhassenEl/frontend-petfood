import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const emptyForm = {
  userId: '',
  items: [{ productId: '', quantity: 1, price: 0 }],
  total: '',
  status: 'pending',
  address: '',
  phone: '',
  paymentMethod: 'cash',
};

const statusOptions = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const statusLabels = { pending: '⏳ En attente', paid: '💰 Payée', shipped: '🚚 Expédiée', delivered: '✅ Livrée', cancelled: '❌ Annulée' };

const getDiscountedPrice = (product) => {
  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);
  return Number((price * (1 - discount / 100)).toFixed(2));
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Users load error', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (error) {
      console.error('Products load error', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (error) {
      console.error('Erreur chargement commandes', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      fetchOrders();
    } catch (error) {
      window.alert('Erreur mise à jour statut');
    }
  };

  const openCreate = () => {
    setEditingOrder(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      userId: order.userId?._id || order.userId || '',
      items: order.items.map(i => ({
        productId: i.productId?._id || i.productId || '',
        quantity: i.quantity,
        price: i.price,
      })),
      total: order.total || '',
      status: order.status || 'pending',
      address: order.address || '',
      phone: order.phone || '',
      paymentMethod: order.paymentMethod || 'cash',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...formData,
        total: Number(formData.total),
        items: formData.items.filter(i => i.productId && i.quantity > 0).map(i => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          price: Number(i.price),
        })),
      };
      if (editingOrder) {
        await api.put(`/orders/${editingOrder._id}`, payload);
      } else {
        await api.post('/orders/admin', payload);
      }
      closeModal();
      fetchOrders();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement commande');
    }
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1, price: 0 }] }));
  };

  const removeItem = (idx) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx, field, value) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'productId') {
        const prod = products.find(p => p._id === value);
        if (prod) items[idx].price = getDiscountedPrice(prod);
      }
      const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      return { ...prev, items, total: total.toFixed(2) };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression commande');
    }
  };

  const filteredOrders = orders.filter((order) =>
    `${order.userId?.email || ''} ${order.status || ''} ${new Date(order.createdAt).toLocaleDateString('fr-TN')}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 style={styles.title}>📦 Gestion des commandes</h1>
          <p style={styles.subtitle}>{orders.length} commande(s)</p>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>➕ Ajouter une commande</button>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher une commande..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchCount}>{filteredOrders.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Articles</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{order.userId?.email || 'N/A'}</strong>
                </td>
                <td style={styles.td}>{order.items?.length || 0}</td>
                <td style={styles.td}>
                  <strong style={{ color: '#059669', fontSize: '16px' }}>{order.total} DT</strong>
                </td>
                <td style={styles.td}>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={styles.select}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </td>
                <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString('fr-TN')}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.editBtn} onClick={() => openEdit(order)} title="Modifier">✏️</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(order._id)} title="Supprimer">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <p style={styles.empty}>Aucune commande trouvée</p>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, width: '640px' }}>
            <h2 style={styles.modalTitle}>{editingOrder ? '✏️ Modifier la commande' : '➕ Nouvelle commande'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                style={styles.input}
              >
                <option value="">Choisir un client</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <div style={styles.row2}>
                <input placeholder="Adresse" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={styles.input} />
                <input placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
              </div>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={styles.input}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#374151', marginTop: '4px' }}>Articles</div>
              {formData.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                    style={{ ...styles.input, flex: 2 }}
                  >
                    <option value="">Choisir un produit</option>
                    {products.map((p) => {
                      const finalPrice = getDiscountedPrice(p);
                      const discount = Number(p.discount || 0);
                      return (
                        <option key={p._id} value={p._id}>
                          {p.name} — {finalPrice.toFixed(2)} DT{discount > 0 ? ` (-${discount}%)` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <input type="number" min="1" placeholder="Qté" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} style={{ ...styles.input, width: '70px' }} />
                  <input type="number" step="0.01" placeholder="Prix" value={item.price} onChange={(e) => updateItem(idx, 'price', e.target.value)} style={{ ...styles.input, width: '90px' }} />
                  <button type="button" style={styles.deleteBtn} onClick={() => removeItem(idx)}>✕</button>
                </div>
              ))}
              <button type="button" style={{ ...styles.addBtn, padding: '8px 14px', fontSize: '13px', alignSelf: 'flex-start' }} onClick={addItem}>+ Ajouter un article</button>
              <input required type="number" step="0.01" placeholder="Total (DT)" value={formData.total} onChange={(e) => setFormData({ ...formData, total: e.target.value })} style={styles.input} />
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingOrder ? '💾 Enregistrer' : '✅ Créer'}</button>
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

export default AdminOrders;
