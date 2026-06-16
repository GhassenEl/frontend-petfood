import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, CheckCircle } from 'lucide-react';

const LivreurDeliveryVerificationPanel = ({ verifications = [], loading }) => {
  if (loading) return <p className="livih-muted">Chargement vérifications…</p>;

  return (
    <div className="livih-panel">
      <p className="livih-summary">
        <Camera size={16} aria-hidden />
        Vérification intelligente par géolocalisation et photo pour garantir la bonne réception du colis.
      </p>
      {!verifications.length && (
        <p className="livih-empty-ok">Aucune livraison en cours nécessitant une preuve.</p>
      )}
      {verifications.map((v) => (
        <div key={v.orderId} className="livih-card livih-verify-card">
          <h4>Commande #{String(v.orderId).slice(-6)}</h4>
          <p><MapPin size={14} /> {v.address}</p>
          <p className="livih-ai-text">{v.aiSummary}</p>
          <ul className="livih-checklist">
            {v.items.map((item) => (
              <li key={item.id}>
                <CheckCircle size={14} className={item.required ? 'livih-req' : ''} />
                {item.label}{item.required ? ' *' : ''}
              </li>
            ))}
          </ul>
          <span className="livih-tag">Rayon geo : {v.geoRadiusMeters} m</span>
        </div>
      ))}
      <Link to="/livreur/orders" className="livih-link">Confirmer une livraison →</Link>
    </div>
  );
};

export default LivreurDeliveryVerificationPanel;
