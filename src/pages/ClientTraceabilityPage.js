import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Shield, Link2, MapPin, CheckCircle2, XCircle, Search } from 'lucide-react';
import api from '../utils/api';
import {
  fetchTraceabilityList,
  fetchProductTraceability,
  verifyProductTraceability,
} from '../services/ecosystemService';
import { getDemoProductTraceability } from '../utils/clientDemoData';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const certBadge = (verified) => ({
  display: 'inline-block',
  margin: '4px 6px 4px 0',
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: verified ? '#ecfdf5' : '#fef2f2',
  color: verified ? '#047857' : '#b91c1c',
  border: `1px solid ${verified ? '#6ee7b7' : '#fca5a5'}`,
});

const ClientTraceabilityPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [trace, setTrace] = useState(null);
  const [verify, setVerify] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const urlProductId = searchParams.get('productId');
    Promise.all([
      fetchTraceabilityList({ limit: 30 }).catch(() => ({ traces: [] })),
      api.get('/products').catch(() => ({ data: [] })),
    ])
      .then(([list, pRes]) => {
        const fromApi = (pRes.data || []).filter((p) => p.category === 'nourriture' || /croquette/i.test(p.name || ''));
        setProducts(fromApi.slice(0, 40));
        const traces = list.traces || [];
        if (urlProductId) {
          setSelectedId(urlProductId);
        } else if (traces[0]?.product?.id) {
          setSelectedId(traces[0].product.id);
          setTrace(traces[0]);
        } else if (fromApi[0]?.id) {
          setSelectedId(fromApi[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const loadTrace = async (productId) => {
    if (!productId) return;
    setLoading(true);
    setMsg('');
    setDemoMode(false);
    try {
      const t = await fetchProductTraceability(productId);
      setTrace(t);
      const v = await verifyProductTraceability(productId);
      setVerify(v);
    } catch (e) {
      const productName = products.find((p) => p.id === productId)?.name;
      const demo = getDemoProductTraceability(productId, productName);
      setTrace(demo);
      setVerify(demo.blockchain?.verification);
      setDemoMode(true);
      setMsg('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) loadTrace(selectedId);
  }, [selectedId]);

  const bc = trace?.blockchain;
  const valid = bc?.isVerified && bc?.verification?.valid;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px', fontWeight: 800 }}>
        <Link2 size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Traçabilité blockchain
      </h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        Origine des aliments, certifications vérifiées et chaîne d&apos;approvisionnement immuable (SHA-256).
      </p>
      {demoMode && (
        <p style={{ margin: '0 0 16px', padding: '10px 14px', borderRadius: 10, background: '#f5f3ff', color: '#6d28d9', fontSize: 13, fontWeight: 600 }}>
          Mode démo — registre blockchain simulé pour ce produit
        </p>
      )}
      <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/client-iot" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none', padding: '8px 14px', background: '#eff6ff', borderRadius: 10 }}>
          📡 Centre IoT
        </Link>
        <Link to="/client-products" style={{ fontSize: 13, fontWeight: 700, color: '#475569', textDecoration: 'none', padding: '8px 14px', background: '#f8fafc', borderRadius: 10 }}>
          🏷️ Boutique
        </Link>
      </div>

      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <Search size={18} color="#64748b" />
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: 10, borderRadius: 8 }}
        >
          <option value="">— Produit —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {valid != null && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              background: valid ? '#ecfdf5' : '#fef2f2',
              color: valid ? '#047857' : '#b91c1c',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {valid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {valid ? 'Chaîne vérifiée' : 'Vérification échouée'}
          </span>
        )}
      </div>

      {loading && <p style={{ color: '#94a3b8' }}>Chargement…</p>}
      {msg && <p style={{ color: '#b91c1c' }}>{msg}</p>}

      {trace && (
        <>
          <div style={{ ...card, background: 'linear-gradient(135deg, #f0f9ff 0%, #fff 50%)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{trace.product?.name}</h2>
            <p style={{ margin: 0, color: '#64748b' }}>
              Lot <strong>{trace.batchCode}</strong> · Réseau {bc?.network}
            </p>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={20} color="#0d9488" /> Origine des aliments
            </h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', fontSize: 15 }}>
              <li style={{ padding: '6px 0' }}>
                <strong>Pays :</strong> {trace.origin?.country}
              </li>
              <li style={{ padding: '6px 0' }}>
                <strong>Région :</strong> {trace.origin?.region || '—'}
              </li>
              <li style={{ padding: '6px 0' }}>
                <strong>Producteur :</strong> {trace.origin?.producer}
              </li>
              <li style={{ padding: '6px 0' }}>
                <strong>Site :</strong> {trace.origin?.facility}
              </li>
              {trace.origin?.harvestDate && (
                <li style={{ padding: '6px 0' }}>
                  <strong>Récolte / production :</strong>{' '}
                  {new Date(trace.origin.harvestDate).toLocaleDateString('fr-FR')}
                </li>
              )}
            </ul>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={20} color="#7c3aed" /> Certifications produit
            </h3>
            {(trace.certifications || []).map((c) => (
              <div key={c.certId} style={{ marginBottom: 12 }}>
                <span style={certBadge(c.verified)}>
                  {c.type} — {c.issuer}
                </span>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
                  {c.standard}
                  {c.validUntil ? ` · valide jusqu'au ${new Date(c.validUntil).toLocaleDateString('fr-FR')}` : ''}
                  <br />
                  ID {c.certId}
                </p>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Chaîne blockchain ({bc?.blockCount} blocs)</h3>
            <p style={{ fontSize: 12, color: '#64748b', wordBreak: 'break-all' }}>
              Racine : {bc?.rootHash}
              <br />
              Dernier bloc : {bc?.lastBlockHash}
            </p>
            <ol style={{ margin: '12px 0 0', paddingLeft: 20 }}>
              {(trace.supplyChain || []).map((s, i) => (
                <li key={i} style={{ marginBottom: 14 }}>
                  <strong>{s.label}</strong>
                  <br />
                  <span style={{ fontSize: 13, color: '#475569' }}>
                    {s.location} — {s.actor}
                  </span>
                  <br />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date(s.timestamp).toLocaleString('fr-FR')}
                  </span>
                  <br />
                  <code style={{ fontSize: 10, color: '#0d9488' }}>{s.hash?.slice(0, 24)}…</code>
                </li>
              ))}
            </ol>
            {bc?.verification && (
              <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: valid ? '#047857' : '#b91c1c' }}>
                {bc.verification.reason}
              </p>
            )}
          </div>
        </>
      )}

      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Registre immuable PetfoodTN — à des fins de transparence client. Les hash garantissent qu&apos;aucune étape
        n&apos;a été modifiée après enregistrement.
      </p>
      <p>
        <Link to="/client-iot">← Centre IoT</Link>
        {' · '}
        <Link to="/client-products">Boutique</Link>
      </p>
    </div>
  );
};

export default ClientTraceabilityPage;
