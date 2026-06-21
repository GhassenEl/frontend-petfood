import React, { useCallback, useEffect, useState } from 'react';
import { Shield, Search, RefreshCw, CheckCircle2, Copy } from 'lucide-react';
import { analyzeTraceBlockchain, sha256Hex } from '../utils/blockchainEngine';
import { getDemoProductTraceability } from '../utils/clientDemoData';
import BlockchainTimeline from '../components/BlockchainTimeline';
import './VendorTraceabilityPage.css';

const DEMO_BATCHES = [
  { id: 'b1', productName: 'Croquettes Premium Chien 12 kg', batchCode: 'PF-TN-2026-A042', producer: 'NutriPet SARL', manufacturedAt: '2026-01-15', status: 'verified' },
  { id: 'b2', productName: 'Pâtée Chat Saumon 400 g', batchCode: 'PF-TN-2026-B018', producer: 'NutriPet SARL', manufacturedAt: '2026-02-02', status: 'verified' },
  { id: 'b3', productName: 'Friandises Dentaires', batchCode: 'PF-TN-2026-C007', producer: 'SnackPet Tunis', manufacturedAt: '2026-02-20', status: 'pending' },
];

const VendorTraceabilityPage = () => {
  const [batches, setBatches] = useState(DEMO_BATCHES);
  const [selected, setSelected] = useState(null);
  const [trace, setTrace] = useState(null);
  const [shaInput, setShaInput] = useState('');
  const [shaResult, setShaResult] = useState('');
  const [search, setSearch] = useState('');

  const loadTrace = useCallback(async (batch) => {
    setSelected(batch);
    const t = getDemoProductTraceability(batch.id, batch.productName);
    const analysis = await analyzeTraceBlockchain(t);
    setTrace({ ...t, localAnalysis: analysis });
    setShaInput(batch.batchCode);
  }, []);

  useEffect(() => {
    loadTrace(batches[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifySha = async () => {
    const hash = await sha256Hex(shaInput);
    setShaResult(hash);
  };

  const filtered = batches.filter((b) => {
    const q = search.toLowerCase();
    return !q || b.productName.toLowerCase().includes(q) || b.batchCode.toLowerCase().includes(q) || b.producer.toLowerCase().includes(q);
  });

  return (
    <div className="vtrace-page">
      <header className="vtrace-hero">
        <h1><Shield size={24} /> Traçabilité alimentaire blockchain</h1>
        <p>Consultation des lots, producteur, date de fabrication et vérification SHA-256.</p>
      </header>

      <div className="vtrace-toolbar">
        <div className="vtrace-search">
          <Search size={16} />
          <input type="search" placeholder="Rechercher lot, produit, producteur…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button type="button" className="vtrace-btn" onClick={() => loadTrace(selected)}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <div className="vtrace-layout">
        <aside className="vtrace-list">
          <h3>Mes lots enregistrés</h3>
          {filtered.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`vtrace-batch${selected?.id === b.id ? ' is-active' : ''}`}
              onClick={() => loadTrace(b)}
            >
              <strong>{b.productName}</strong>
              <span>{b.batchCode}</span>
              <small>{b.producer} · {b.manufacturedAt}</small>
            </button>
          ))}
        </aside>

        {trace && (
          <main className="vtrace-detail">
            <div className="vtrace-cards">
              <article className="vtrace-card">
                <h4>Producteur</h4>
                <p><strong>{trace.origin.producer}</strong></p>
                <p>{trace.origin.facility}</p>
                <p>{trace.origin.region}, {trace.origin.country}</p>
              </article>
              <article className="vtrace-card">
                <h4>Numéro de lot</h4>
                <p className="vtrace-mono">{trace.batchCode}</p>
              </article>
              <article className="vtrace-card">
                <h4>Date de fabrication</h4>
                <p>{selected?.manufacturedAt || new Date(trace.origin.harvestDate).toLocaleDateString('fr-FR')}</p>
              </article>
              <article className="vtrace-card">
                <h4>Vérification blockchain</h4>
                <p className={trace.blockchain.isVerified ? 'vtrace-ok' : 'vtrace-warn'}>
                  <CheckCircle2 size={14} /> {trace.blockchain.isVerified ? 'Chaîne intacte' : 'En attente'}
                </p>
                <p className="vtrace-mono" style={{ fontSize: 11 }}>{trace.blockchain.rootHash?.slice(0, 32)}…</p>
              </article>
            </div>

            <section className="vtrace-sha">
              <h3>Vérification SHA-256</h3>
              <div className="vtrace-sha-row">
                <input value={shaInput} onChange={(e) => setShaInput(e.target.value)} placeholder="Entrer lot ou payload…" />
                <button type="button" onClick={verifySha}>Calculer hash</button>
              </div>
              {shaResult && (
                <p className="vtrace-mono">
                  {shaResult}
                  <button type="button" className="vtrace-copy" onClick={() => navigator.clipboard?.writeText(shaResult)}><Copy size={12} /></button>
                </p>
              )}
              {trace.localAnalysis && (
                <p style={{ fontSize: 13, color: '#64748b' }}>{trace.localAnalysis.summary || trace.blockchain.verification?.reason}</p>
              )}
            </section>

            <BlockchainTimeline steps={trace.supplyChain || []} />
          </main>
        )}
      </div>
    </div>
  );
};

export default VendorTraceabilityPage;
