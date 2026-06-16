import React from 'react';
import DeliveryColdChainPanel from '../components/DeliveryColdChainPanel';
import '../components/DeliveryColdChain.css';

const DeliveryColdChainSurveillancePage = ({ role = 'admin' }) => (
  <div className="dcc-page">
    <header className="dcc-page-hero">
      <h1>🚚 Surveillance livraison — chaîne du froid IoT</h1>
      <p>
        Véhicules équipés de capteurs transmettent température, humidité, luminosité et qualité de l&apos;air
        en temps réel — de l&apos;entrepôt jusqu&apos;à la réception par le client. L&apos;IA détecte les anomalies
        et prédit la conservation des lots.
      </p>
    </header>
    <DeliveryColdChainPanel role={role} />
  </div>
);

export default DeliveryColdChainSurveillancePage;
