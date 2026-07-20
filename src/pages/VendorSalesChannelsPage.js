import React, { useCallback, useEffect, useState } from 'react';
import { Store, Phone, Mail, ShoppingBag, Save, Plus } from 'lucide-react';
import api from '../utils/api';
import { SALES_CHANNELS, salesChannelLabel } from '../constants/salesChannels';
import { formatDT } from '../utils/formatCurrency';
import { fetchVendorCatalog } from '../services/vendorService';
import './VendorPages.css';

const VendorSalesChannelsPage = () => {
  const [channels, setChannels] = useState(['online']);
  const [storeHours, setStoreHours] = useState('');
  const [phoneOrdersNumber, setPhoneOrdersNumber] = useState('');
  const [commercialAddress, setCommercialAddress] = useState('');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [products, setProducts] = useState([]);
  const [offlineForm, setOfflineForm] = useState({
    salesChannel: 'instore',
    clientName: '',
    phone: '',
    address: '',
    note: '',
    productId: '',
    quantity: '1',
    price: '',
  });
  const [offlineBusy, setOfflineBusy] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, catalog] = await Promise.all([
        api.get('/ecosystem/vendor/sales-channels'),
        fetchVendorCatalog(),
      ]);
      setChannels(data.channels || ['online']);
      setStoreHours(data.storeHours || '');
      setPhoneOrdersNumber(data.phoneOrdersNumber || '');
      setCommercialAddress(data.commercialAddress || '');
      setShopName(data.shopName || '');
      setProducts(catalog.data?.products || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Impossible de charger les canaux');
      setChannels(['online']);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleChannel = (id) => {
    if (id === 'online') return; // toujours actif
    setChannels((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const { data } = await api.put('/ecosystem/vendor/sales-channels', {
        channels,
        storeHours,
        phoneOrdersNumber,
        commercialAddress,
      });
      setChannels(data.channels || channels);
      setMsg('Canaux de vente enregistrés.');
    } catch (e) {
      setError(e?.response?.data?.error || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const createOffline = async (e) => {
    e.preventDefault();
    setOfflineBusy(true);
    setError('');
    setMsg('');
    try {
      const product = products.find((p) => p.id === offlineForm.productId || p.productId === offlineForm.productId);
      const { data } = await api.post('/ecosystem/vendor/offline-orders', {
        salesChannel: offlineForm.salesChannel,
        clientName: offlineForm.clientName,
        phone: offlineForm.phone,
        address: offlineForm.address || commercialAddress,
        note: offlineForm.note,
        items: [
          {
            productId: offlineForm.productId || undefined,
            name: product?.name,
            quantity: Number(offlineForm.quantity || 1),
            price: offlineForm.price !== '' ? Number(offlineForm.price) : undefined,
          },
        ],
      });
      setLastOrder(data);
      setMsg(`Commande ${salesChannelLabel(data.salesChannel)} enregistrée — ${formatDT(data.total)}`);
      setOfflineForm((f) => ({ ...f, clientName: '', note: '', quantity: '1' }));
    } catch (err) {
      setError(err?.response?.data?.error || 'Création commande impossible');
    } finally {
      setOfflineBusy(false);
    }
  };

  const offlineEnabled = channels.filter((c) => c !== 'online');

  return (
    <div className="vnd-page">
      <header className="vnd-hero">
        <h1><Store size={24} /> Canaux de vente</h1>
        <p>
          Vendez votre catalogue en ligne, en magasin (présentiel), par téléphone ou par courrier/colis.
          {shopName ? ` — ${shopName}` : ''}
        </p>
      </header>

      {msg && <p style={{ color: '#0d9488', fontWeight: 700, marginBottom: 12 }}>{msg}</p>}
      {error && <p style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 12 }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement…</p>
      ) : (
        <>
          <section className="vnd-card" style={{ marginBottom: 20 }}>
            <h2>Activer les canaux</h2>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {SALES_CHANNELS.map((ch) => {
                const on = channels.includes(ch.id);
                const locked = ch.id === 'online';
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    disabled={locked}
                    style={{
                      textAlign: 'left',
                      padding: 16,
                      borderRadius: 14,
                      border: on ? '2px solid #0d9488' : '1px solid #e2e8f0',
                      background: on ? '#f0fdfa' : 'white',
                      cursor: locked ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{ch.icon}</div>
                    <div style={{ fontWeight: 800 }}>{ch.label}{locked ? ' (toujours actif)' : ''}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{ch.description}</div>
                    <div style={{ marginTop: 8, fontWeight: 700, color: on ? '#0f766e' : '#94a3b8' }}>
                      {on ? 'Activé' : 'Désactivé'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 18 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>
                <Store size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Adresse magasin (présentiel)
                <input
                  value={commercialAddress}
                  onChange={(e) => setCommercialAddress(e.target.value)}
                  placeholder="Adresse de l’animalerie"
                  style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </label>
              <label style={{ fontWeight: 600, fontSize: 13 }}>
                Horaires magasin
                <input
                  value={storeHours}
                  onChange={(e) => setStoreHours(e.target.value)}
                  placeholder="Lun–Sam 9h–19h"
                  style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </label>
              <label style={{ fontWeight: 600, fontSize: 13 }}>
                <Phone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                N° commandes téléphone
                <input
                  value={phoneOrdersNumber}
                  onChange={(e) => setPhoneOrdersNumber(e.target.value)}
                  placeholder="+216 …"
                  style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </label>
            </div>

            <button
              type="button"
              className="vnd-btn vnd-btn--primary"
              onClick={save}
              disabled={saving}
              style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer les canaux'}
            </button>
          </section>

          <section className="vnd-card">
            <h2><Plus size={18} style={{ verticalAlign: 'middle' }} /> Nouvelle vente hors ligne</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 14 }}>
              Saisissez une vente présentiel, téléphone ou courrier sur votre catalogue.
            </p>
            {!offlineEnabled.length ? (
              <p style={{ color: '#b45309' }}>Activez au moins un canal hors ligne (magasin, téléphone ou courrier).</p>
            ) : (
              <form onSubmit={createOffline}>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>
                    Canal *
                    <select
                      required
                      value={offlineForm.salesChannel}
                      onChange={(e) => setOfflineForm((f) => ({ ...f, salesChannel: e.target.value }))}
                      style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    >
                      {offlineEnabled.map((id) => (
                        <option key={id} value={id}>{salesChannelLabel(id)}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>
                    Client *
                    <input
                      required
                      value={offlineForm.clientName}
                      onChange={(e) => setOfflineForm((f) => ({ ...f, clientName: e.target.value }))}
                      style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </label>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>
                    Téléphone
                    <input
                      value={offlineForm.phone}
                      onChange={(e) => setOfflineForm((f) => ({ ...f, phone: e.target.value }))}
                      style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </label>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>
                    <Mail size={14} style={{ verticalAlign: 'middle' }} /> Adresse (courrier)
                    <input
                      value={offlineForm.address}
                      onChange={(e) => setOfflineForm((f) => ({ ...f, address: e.target.value }))}
                      style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </label>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>
                    <ShoppingBag size={14} style={{ verticalAlign: 'middle' }} /> Produit
                    <select
                      value={offlineForm.productId}
                      onChange={(e) => {
                        const p = products.find((x) => (x.id || x.productId) === e.target.value);
                        setOfflineForm((f) => ({
                          ...f,
                          productId: e.target.value,
                          price: p?.price != null ? String(p.price) : f.price,
                        }));
                      }}
                      style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    >
                      <option value="">— Article libre —</option>
                      {products.map((p) => (
                        <option key={p.id || p.productId} value={p.id || p.productId}>
                          {p.name} ({formatDT(p.price)})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>
                    Quantité
                    <input
                      type="number"
                      min="1"
                      value={offlineForm.quantity}
                      onChange={(e) => setOfflineForm((f) => ({ ...f, quantity: e.target.value }))}
                      style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </label>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>
                    Prix unitaire (TND)
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.1"
                      value={offlineForm.price}
                      onChange={(e) => setOfflineForm((f) => ({ ...f, price: e.target.value }))}
                      style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </label>
                </div>
                <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginTop: 12 }}>
                  Note
                  <input
                    value={offlineForm.note}
                    onChange={(e) => setOfflineForm((f) => ({ ...f, note: e.target.value }))}
                    style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                </label>
                <button
                  type="submit"
                  className="vnd-btn vnd-btn--primary"
                  disabled={offlineBusy}
                  style={{ marginTop: 14 }}
                >
                  {offlineBusy ? 'Enregistrement…' : 'Enregistrer la vente'}
                </button>
              </form>
            )}
            {lastOrder && (
              <div style={{ marginTop: 16, padding: 12, background: '#f0fdfa', borderRadius: 10, fontSize: 14 }}>
                Dernière vente : <strong>{lastOrder.salesChannelLabel}</strong> — {formatDT(lastOrder.total)} — statut {lastOrder.status}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default VendorSalesChannelsPage;
