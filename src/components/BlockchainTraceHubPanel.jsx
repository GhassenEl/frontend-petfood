import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import EthicalDisclaimer from './EthicalDisclaimer';

const DEMO_TRACE = {
  batchCode: 'PF-TN-2026-A042',
  product: 'Croquettes Premium Chien 12 kg',
  origin: 'Usine PetfoodTN — Sfax, Tunisie',
  ingredients: 'Poulet 32 %, riz, maïs, huile de poisson',
  deliverySteps: [
    { step: 'Production', at: '2026-02-10', hash: 'a3f8…c21' },
    { step: 'Contrôle qualité', at: '2026-02-11', hash: 'b91e…44a' },
    { step: 'Expédition entrepôt', at: '2026-02-12', hash: 'c02d…88f' },
    { step: 'Livraison client', at: '2026-03-08', hash: 'd17a…09b' },
  ],
  verified: true,
};

const BlockchainTraceHubPanel = () => (
  <section className="shub-panel">
    <header className="shub-panel__head">
      <Link2 size={20} color="#2563eb" />
      <div>
        <h3>Blockchain &amp; traçabilité</h3>
        <p>Historique infalsifiable des livraisons et vérification de l&apos;origine des produits.</p>
      </div>
    </header>

    <EthicalDisclaimer variant="blockchain" compact />

    <div className="shub-trace-card">
      <div className="shub-trace-card__head">
        <strong>{DEMO_TRACE.product}</strong>
        <span className={`shub-verify${DEMO_TRACE.verified ? ' is-ok' : ''}`}>
          {DEMO_TRACE.verified ? <><CheckCircle2 size={14} /> Vérifié</> : 'Non vérifié'}
        </span>
      </div>
      <p className="shub-trace-batch">Lot : <code>{DEMO_TRACE.batchCode}</code></p>
      <p><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {DEMO_TRACE.origin}</p>
      <p style={{ fontSize: 13, color: '#64748b' }}>{DEMO_TRACE.ingredients}</p>

      <h4>Chaîne d&apos;approvisionnement</h4>
      <ol className="shub-trace-chain">
        {DEMO_TRACE.deliverySteps.map((s) => (
          <li key={s.step}>
            <Truck size={14} aria-hidden />
            <div>
              <strong>{s.step}</strong>
              <span>{s.at} · SHA-256 {s.hash}</span>
            </div>
          </li>
        ))}
      </ol>

      <p className="shub-trace-example">
        <strong>Exemple :</strong> le client consulte l&apos;origine exacte des croquettes achetées via scan QR ou code lot.
      </p>

      <Link to="/client-traceability" className="shub-link-btn">Vérifier un lot →</Link>
    </div>
  </section>
);

export default BlockchainTraceHubPanel;
