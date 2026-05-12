import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const emptyForm = {
  name: '',
  price: '',
  discount: '',
  description: '',
  stock: '',
  animalType: 'dog',
  imageUrl: '',
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stockTargets, setStockTargets] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustForm, setStockAdjustForm] = useState({ adjustment: '', reason: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
      const lowRes = await api.get('/products/low-stock?threshold=10');
      setLowStockProducts(lowRes.data || []);
    } catch (error) {
      console.error('Erreur chargement produits', error);
      setProducts([]);
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      discount: product.discount || '',
      description: product.description || '',
      stock: product.stock || '',
      animalType: product.animalType || 'dog',
      imageUrl: product.imageUrl || product.image || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discount: Number(formData.discount || 0),
        stock: Number(formData.stock || 0),
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement produit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression produit');
    }
  };

  const openStockAdjust = (targets) => {
    setStockTargets(targets);
    setStockAdjustForm({ adjustment: '', reason: '' });
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setStockTargets([]);
    setStockAdjustForm({ adjustment: '', reason: '' });
  };

  const handleStockAdjust = async (event) => {
    event.preventDefault();
    const adjustment = Number(stockAdjustForm.adjustment);

    if (!Number.isFinite(adjustment) || adjustment === 0) {
      window.alert('Entrez un ajustement different de 0');
      return;
    }
    if (stockTargets.length === 0) {
      window.alert('Aucun produit selectionne');
      return;
    }

    try {
      await Promise.all(stockTargets.map((product) =>
        api.patch(`/products/${product._id}/stock/adjust`, {
          adjustment,
          reason: stockAdjustForm.reason || 'Ajustement manuel',
        })
      ));
      closeStockModal();
      setSelectedProducts([]);
      fetchProducts();
      window.alert(stockTargets.length > 1 ? 'Stocks ajustes !' : 'Stock ajuste !');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur ajustement stock');
    }
  };

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.animalType || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 style={styles.title}>📦 Gestion des produits</h1>
          <p style={styles.subtitle}>{products.length} produits en catalogue</p>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>➕ Ajouter un produit</button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div style={styles.lowStockAlert}>
          <h3 style={styles.alertTitle}>⚠️ Stocks bas ({lowStockProducts.length})</h3>
          <div style={styles.alertList}>
            {lowStockProducts.slice(0, 5).map(product => (
              <span key={product._id} style={styles.alertItem}>
                {product.name} ({product.stock})
              </span>
            ))}
{lowStockProducts.length > 5 && `... et ${lowStockProducts.length - 5} autres`}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div style={styles.bulkBar}>
          <span>{selectedProducts.length} sélectionné(s)</span>
          <button onClick={() => openStockAdjust(selectedProducts)} style={styles.bulkBtn}>
            Ajuster stock en bulk
          </button>
        </div>
      )}

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchCount}>{filteredProducts.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sélection</th>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Prix</th>
              <th style={styles.th}>Remise</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const finalPrice = Number(product.price) * (1 - Number(product.discount || 0) / 100);
              return (
                <tr key={product._id} style={styles.tr}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.some(p => p._id === product._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
                        }
                      }}
                      style={{ transform: 'scale(1.2)', marginRight: '8px' }}
                    />
                  </td>
                  <td style={styles.td}>
                    <img
                      src={product.imageUrl || product.image || 'https://via.placeholder.com/50?text=🐕'}
                      alt={product.name}
                      style={styles.productImg}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=🐕'; }}
                    />
                  </td>
                  <td style={styles.td}>
                    <strong>{product.name}</strong>
<div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{product.description?.length > 100 ? product.description.substring(0, 100) + '...' : product.description}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge(product.animalType)}>
                      {product.animalType === 'dog' ? '🐕' : product.animalType === 'cat' ? '🐈' : product.animalType === 'bird' ? '🐦' : product.animalType === 'fish' ? '🐟' : '🐾'} {product.animalType || 'general'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong style={{ color: '#059669', fontSize: '16px' }}>{finalPrice.toFixed(2)} DT</strong>
                    {product.discount > 0 && (
                      <div style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>{product.price} DT</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    {product.discount > 0 ? (
                      <span style={styles.discountBadge}>{product.discount}%</span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.stockBadge(product.stock)}>{product.stock}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={styles.editBtn} onClick={() => openEdit(product)} title="Modifier">
                        ✏️
                      </button>
                      <button style={styles.adjustBtn} onClick={() => openStockAdjust([product])} title="Ajuster stock">
                        ⚖️
                      </button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(product._id)} title="Supprimer">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <p style={styles.empty}>Aucun produit trouvé</p>
        )}
      </div>

      {/* Modal */}
      {showStockModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>⚖️ Ajuster stock</h2>
            <div style={styles.stockTargetBox}>
              {stockTargets.length === 1 ? (
                <span><strong>{stockTargets[0].name}</strong> - stock actuel: {stockTargets[0].stock}</span>
              ) : (
                <span><strong>{stockTargets.length}</strong> produits selectionnes</span>
              )}
            </div>
            <form onSubmit={handleStockAdjust} style={styles.form}>
              <input
                required
                type="number"
                placeholder="Ajustement (+/-)"
                value={stockAdjustForm.adjustment}
                onChange={(e) => setStockAdjustForm({ ...stockAdjustForm, adjustment: e.target.value })}
                style={styles.input}
              />
              <input
                placeholder="Raison (ex: réception, vente)"
                value={stockAdjustForm.reason}
                onChange={(e) => setStockAdjustForm({ ...stockAdjustForm, reason: e.target.value })}
                style={styles.input}
              />
              {stockAdjustForm.adjustment && stockTargets.length > 0 && (
                <div style={styles.stockPreview}>
                  {stockTargets.slice(0, 5).map((product) => {
                    const nextStock = Math.max(0, Number(product.stock || 0) + Number(stockAdjustForm.adjustment || 0));
                    return (
                      <span key={product._id}>{product.name}: {product.stock} -&gt; {nextStock}</span>
                    );
                  })}
                  {stockTargets.length > 5 && <span>... et {stockTargets.length - 5} autres</span>}
                </div>
              )}
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeStockModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Appliquer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingProduct ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input required placeholder="Nom du produit" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.input} />
              <div style={styles.row2}>
                <input required type="number" step="0.01" placeholder="Prix (DT)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={styles.input} />
                <input type="number" step="1" placeholder="Remise %" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} style={styles.input} />
              </div>
              <div style={styles.row2}>
                <input type="number" step="1" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} style={styles.input} />
                <select value={formData.animalType} onChange={(e) => setFormData({ ...formData, animalType: e.target.value })} style={styles.input}>
                  <option value="dog">🐕 Chien</option>
                  <option value="cat">🐈 Chat</option>
                  <option value="bird">🐦 Oiseau</option>
                  <option value="fish">🐟 Poisson</option>
                  <option value="other">🐾 Autre</option>
                </select>
              </div>
              <input placeholder="URL de l'image" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} style={styles.input} />
              <textarea placeholder="Description" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={styles.input} />
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingProduct ? '💾 Enregistrer' : '✅ Créer'}</button>
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
  productImg: { width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  typeBadge: (type) => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: type === 'dog' ? '#dbeafe' : type === 'cat' ? '#fce7f3' : type === 'bird' ? '#fef3c7' : type === 'fish' ? '#d1fae5' : '#f3f4f6', color: type === 'dog' ? '#1e40af' : type === 'cat' ? '#be185d' : type === 'bird' ? '#b45309' : type === 'fish' ? '#065f46' : '#4b5563' }),
  discountBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '800' },
  stockBadge: (stock) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', background: stock > 10 ? '#dcfce7' : stock > 0 ? '#fef3c7' : '#fee2e2', color: stock > 10 ? '#166534' : stock > 0 ? '#92400e' : '#991b1b', fontSize: '12px', fontWeight: '700' }),
  editBtn: { padding: '6px 10px', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  adjustBtn: { padding: '6px 10px', background: '#dbeafe', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  deleteBtn: { padding: '6px 10px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  lowStockAlert: { background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '16px', marginBottom: '20px' },
  alertTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#92400e' },
  alertList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
  alertItem: { background: '#fefce8', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', color: '#92400e' },
  bulkBar: { background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', padding: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bulkBtn: { padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'white', borderRadius: '20px', padding: '28px', width: '520px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#111827' },
  stockTargetBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', marginBottom: '14px', color: '#065f46', fontSize: '14px' },
  stockPreview: { display: 'flex', flexDirection: 'column', gap: '4px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 12px', color: '#4b5563', fontSize: '13px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: { padding: '10px 18px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#4b5563' },
  saveBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
};

export default AdminProducts;
