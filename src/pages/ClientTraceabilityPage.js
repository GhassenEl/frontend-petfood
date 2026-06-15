import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shield, Link2, MapPin, CheckCircle2, XCircle, Search, RefreshCw,
  Package, QrCode, Copy, Beaker, AlertTriangle,
} from 'lucide-react';
import api from '../utils/api';
import BlockchainTimeline from '../components/BlockchainTimeline';
import DemoModePill from '../components/DemoModePill';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import {
  fetchTraceabilityList,
  fetchProductTraceability,
  verifyProductTraceability,
  fetchMyOrderTraces,
  verifyBatchCode,
} from '../services/traceabilityService';
import { getDemoProductTraceability, DEMO_MY_ORDER_TRACES } from '../utils/clientDemoData';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
  border: '1px solid #f1f5f9',
};

const TABS = [
  { id: 'explorer', label: 'Explorateur' },
  { id: 'orders', label: 'Mes achats' },
  { id: 'verify', label: 'Vérifier un lot' },
];

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

const TrustMeter = ({ score = 0 }) => {
  const color = score >= 85 ? '#059669' : score >= 65 ? '#d97706' : '#dc2626';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
        <span>Score de confiance</span>
        <span style={{ color }}>{score}/100</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, score)}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
};

const ClientTraceabilityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState('explorer');
  const [catalog, setCatalog] = useState([]);
  const [traceList, setTraceList] = useState([]);
  const [orderTraces, setOrderTraces] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [trace, setTrace] = useState(null);
  const [verify, setVerify] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResult, setBatchResult] = useState(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [list, pRes, orders] = await Promise.all([
        fetchTraceabilityList({ limit: 30 }).catch(() => ({ traces: [] })),
        api.get('/products').catch(() => ({ data: [] })),
        fetchMyOrderTraces().catch(() => null),
      ]);
      const traces = list.traces || [];
      setTraceList(traces);
      const foodProducts = (pRes.data || []).filter(
        (p) => p.category === 'nourriture' || /croquette|pâtée|nourriture/i.test(p.name || ''),
      );
      setCatalog(foodProducts.slice(0, 40));
      setOrderTraces(orders?.orders ? orders : DEMO_MY_ORDER_TRACES);
      setDemoMode(!traces.length && !orders?.orders?.length);

      const urlProductId = searchParams.get('productId');
      const urlBatch = searchParams.get('batch');
      if (urlBatch) {
        setTab('verify');
        setBatchInput(urlBatch);
      } else if (urlProductId) {
        setSelectedId(urlProductId);
      } else if (traces[0]?.product?.id) {
        setSelectedId(traces[0].product.id);
      } else if (foodProducts[0]?.id) {
        setSelectedId(foodProducts[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  usePlatformRefresh(loadOverview, [loadOverview]);

  const loadTrace = useCallback(async (productId) => {
    if (!productId) return;
    setLoading(true);
    setDemoMode(false);
    try {
      const t = await fetchProductTraceability(productId);
      setTrace(t);
      const v = await verifyProductTraceability(productId);
      setVerify(v);
    } catch {
      const productName = catalog.find((p) => p.id === productId)?.name;
      const demo = getDemoProductTraceability(productId, productName);
      setTrace(demo);
      setVerify(demo.blockchain?.verification);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  useEffect(() => {
    if (selectedId && tab === 'explorer') loadTrace(selectedId);
  }, [selectedId, tab, loadTrace]);

  const runBatchVerify = async () => {
    const code = batchInput.trim();
    if (!code) return;
    setBatchBusy(true);
    setBatchResult(null);
    try {
      const res = await verifyBatchCode(code);
      setBatchResult(res);
      if (res.found && res.trace?.product?.id) {
        setSelectedId(res.trace.product.id);
        setTrace(res.trace);
        setVerify(res.verification);
      }
    } catch {
      const demo = getDemoProductTraceability('batch-demo', `Lot ${code}`);
      demo.batchCode = code;
      setBatchResult({ found: true, batchCode: code, trace: demo, verification: demo.blockchain?.verification });
      setTrace(demo);
      setDemoMode(true);
    } finally {
      setBatchBusy(false);
    }
  };

  useEffect(() => {
    const urlBatch = searchParams.get('batch');
    if (urlBatch && !batchResult) {
      setBatchInput(urlBatch);
      runBatchVerify();
    }
  }, []);

  const bc = trace?.blockchain;
  const valid = bc?.isVerified && (bc?.verification?.valid ?? verify?.valid);

  const kpis = useMemo(() => ({
    traced: traceList.length || catalog.length,
    verified: traceList.filter((t) => t.blockchain?.isVerified).length,
    orders: orderTraces?.total || 0,
  }), [traceList, catalog, orderTraces]);

  const copyHash = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopyMsg('Hash copié !');
      setTimeout(() => setCopyMsg(''), 2000);
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{
        ...card,
        background: 'linear-gradient(135deg, #0f766e, #115e59, #134e4a)',
        color: '#fff',
        border: 'none',
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 26, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link2 size={28} /> Traçabilité blockchain
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 14, maxWidth: 560 }}>
              Origine, certifications, chaîne d&apos;approvisionnement immuable (SHA-256) et vérification de lot en temps réel.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {demoMode && <DemoModePill />}
            <button type="button" onClick={loadOverview} style={btnLight}>
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 20 }}>
          <Kpi label="Produits tracés" value={kpis.traced} />
          <Kpi label="Chaînes vérifiées" value={kpis.verified || (valid ? 1 : 0)} />
          <Kpi label="Achats traçables" value={kpis.orders} />
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 16px', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
              border: tab === t.id ? '2px solid #0f766e' : '1px solid #e2e8f0',
              background: tab === t.id ? '#f0fdfa' : '#fff',
              color: tab === t.id ? '#0f766e' : '#475569',
            }}
          >
            {t.label}
          </button>
        ))}
        <Link to="/client-iot" style={navChip}>📡 IoT</Link>
        <Link to="/client-products" style={navChip}>🏷️ Boutique</Link>
      </div>

      {tab === 'explorer' && (
        <>
          <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Search size={18} color="#64748b" />
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setSearchParams(e.target.value ? { productId: e.target.value } : {});
              }}
              style={{ flex: 1, minWidth: 220, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
            >
              <option value="">— Choisir un produit —</option>
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {valid != null && <StatusBadge valid={valid} />}
          </div>

          {traceList.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
              {traceList.slice(0, 6).map((t) => (
                <button
                  key={t.product?.id}
                  type="button"
                  onClick={() => setSelectedId(t.product?.id)}
                  style={{
                    ...card, marginBottom: 0, textAlign: 'left', cursor: 'pointer',
                    border: selectedId === t.product?.id ? '2px solid #0f766e' : card.border,
                  }}
                >
                  <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 13 }}>{t.product?.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Lot {t.batchCode}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: t.blockchain?.isVerified ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    {t.blockchain?.isVerified ? '✓ Vérifié' : '✗ Non vérifié'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {loading && <p style={{ color: '#94a3b8' }}>Chargement de la chaîne…</p>}
          {trace && <TraceDetail trace={trace} valid={valid} onCopyHash={copyHash} copyMsg={copyMsg} />}
        </>
      )}

      {tab === 'orders' && (
        <div>
          {(orderTraces?.orders || []).map((order) => (
            <div key={order.orderId} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <div>
                  <strong>Commande #{String(order.orderId).slice(0, 12)}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                    {order.date ? new Date(order.date).toLocaleDateString('fr-FR') : '—'} · {order.status || '—'}
                  </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', background: '#ecfdf5', padding: '4px 10px', borderRadius: 8 }}>
                  {(order.traces || []).length} produit(s) tracé(s)
                </span>
              </div>
              {(order.traces || []).map((t) => (
                <button
                  key={t.product?.id}
                  type="button"
                  onClick={() => { setSelectedId(t.product?.id); setTrace(t); setTab('explorer'); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: 12, marginBottom: 8,
                    borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer',
                  }}
                >
                  <Package size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {t.product?.name} — Lot <code>{t.batchCode}</code>
                </button>
              ))}
            </div>
          ))}
          {!orderTraces?.orders?.length && (
            <p style={{ color: '#64748b' }}>Aucun achat alimentaire traçable pour le moment.</p>
          )}
        </div>
      )}

      {tab === 'verify' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={20} color="#0f766e" /> Vérifier un numéro de lot
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: 14, color: '#64748b' }}>
            Saisissez le code imprimé sur l&apos;emballage (ex. PF-TN-2026-A042) pour authentifier la chaîne blockchain.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="PF-TN-2026-XXXX"
              style={{ flex: 1, minWidth: 200, padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
            />
            <button type="button" onClick={runBatchVerify} disabled={batchBusy} style={btnPrimary}>
              {batchBusy ? 'Vérification…' : 'Vérifier'}
            </button>
          </div>
          {batchResult && (
            <div style={{
              marginTop: 16, padding: 14, borderRadius: 12,
              background: batchResult.found ? '#ecfdf5' : '#fef2f2',
              color: batchResult.found ? '#065f46' : '#991b1b',
            }}
            >
              {batchResult.found ? (
                <>
                  <CheckCircle2 size={18} style={{ verticalAlign: 'middle' }} /> Lot <strong>{batchResult.batchCode}</strong> authentifié — {batchResult.verification?.reason || 'Chaîne valide'}
                </>
              ) : (
                <>
                  <XCircle size={18} style={{ verticalAlign: 'middle' }} /> {batchResult.message || 'Lot introuvable'}
                </>
              )}
            </div>
          )}
          {batchResult?.found && batchResult.trace && (
            <div style={{ marginTop: 16 }}>
              <TraceDetail trace={batchResult.trace} valid={batchResult.verification?.valid} onCopyHash={copyHash} compact />
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>
        Registre immuable PetfoodTN — transparence alimentaire. Les hash SHA-256 garantissent l&apos;intégrité de chaque étape.
      </p>
    </div>
  );
};

const TraceDetail = ({ trace, valid, onCopyHash, copyMsg, compact }) => {
  const bc = trace?.blockchain;
  return (
    <>
      <div style={{ ...card, background: 'linear-gradient(135deg, #f0f9ff 0%, #fff 50%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: compact ? 16 : 18 }}>{trace.product?.name}</h2>
            <p style={{ margin: 0, color: '#64748b' }}>
              Lot <strong>{trace.batchCode}</strong> · {bc?.network || bc?.algorithm}
            </p>
          </div>
          {!compact && <TrustMeter score={bc?.trustScore || (valid ? 90 : 40)} />}
        </div>
        {copyMsg && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#059669' }}>{copyMsg}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} color="#0d9488" /> Origine
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14 }}>
            <li style={li}>Pays : <strong>{trace.origin?.country}</strong></li>
            <li style={li}>Région : {trace.origin?.region || '—'}</li>
            <li style={li}>Producteur : {trace.origin?.producer}</li>
            <li style={li}>Site : {trace.origin?.facility}</li>
          </ul>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Beaker size={20} color="#7c3aed" /> Composition
          </h3>
          {trace.nutrition && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {Object.entries(trace.nutrition).map(([k, v]) => (
                <span key={k} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: '#f5f3ff', color: '#6d28d9', fontWeight: 700 }}>
                  {k}: {v}
                </span>
              ))}
            </div>
          )}
          {trace.ingredients?.length > 0 && (
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#475569' }}>
              <strong>Ingrédients :</strong> {trace.ingredients.join(', ')}
            </p>
          )}
          {trace.allergens?.length > 0 && (
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> Allergènes : {trace.allergens.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={20} color="#7c3aed" /> Certifications
        </h3>
        {(trace.certifications || []).map((c) => (
          <div key={c.certId} style={{ marginBottom: 10 }}>
            <span style={certBadge(c.verified)}>{c.type} — {c.issuer}</span>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{c.standard} · ID {c.certId}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Chaîne blockchain ({bc?.blockCount} blocs)</h3>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, wordBreak: 'break-all' }}>
          Racine : {bc?.rootHash}
          <button type="button" onClick={() => onCopyHash(bc?.rootHash)} style={copyBtn} title="Copier">
            <Copy size={12} />
          </button>
        </div>
        <BlockchainTimeline steps={trace.supplyChain || []} valid={valid} />
        {bc?.verification && (
          <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: valid ? '#047857' : '#b91c1c' }}>
            {bc.verification.reason}
          </p>
        )}
      </div>

      {trace.qrPayload && !compact && (
        <div style={{ ...card, textAlign: 'center' }}>
          <QrCode size={48} color="#0f766e" style={{ marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>QR Lot {trace.qrPayload.batchCode}</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>Scannez pour revérifier sur PetfoodTN</p>
        </div>
      )}
    </>
  );
};

const Kpi = ({ label, value }) => (
  <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.12)', textAlign: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 900 }}>{value}</div>
    <div style={{ fontSize: 11, opacity: 0.85 }}>{label}</div>
  </div>
);

const StatusBadge = ({ valid }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
    background: valid ? '#ecfdf5' : '#fef2f2', color: valid ? '#047857' : '#b91c1c', fontWeight: 700, fontSize: 13,
  }}
  >
    {valid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
    {valid ? 'Chaîne vérifiée' : 'Vérification échouée'}
  </span>
);

const btnLight = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const btnPrimary = { padding: '12px 20px', borderRadius: 10, border: 'none', background: '#0f766e', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const navChip = { fontSize: 13, fontWeight: 700, color: '#475569', textDecoration: 'none', padding: '10px 14px', background: '#f8fafc', borderRadius: 10 };
const li = { padding: '5px 0' };
const copyBtn = { marginLeft: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#0f766e', verticalAlign: 'middle' };

export default ClientTraceabilityPage;
