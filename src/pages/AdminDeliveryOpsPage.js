import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Clock, AlertTriangle } from 'lucide-react';
import DeliveryColdChainPanel from '../components/DeliveryColdChainPanel';
import { fetchDeliveryColdChainSurveillance } from '../services/deliveryColdChainService';
import { DEMO_ADMIN_REGIONS } from '../utils/adminDemoData';
import './AdminPages.css';

const AdminDeliveryOpsPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDeliveryColdChainSurveillance('admin');
      setDeliveries(data?.deliveries || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const delayed = deliveries.filter((d) => (d.delayMinutes ?? 0) > 15);

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Truck size={24} /> Opérations livraison</h1>
        <p>
          Suivi GPS / ETA, contrôle des délais, historique trajets et zones de livraison.
          {' '}
          <Link to="/admin/livreurs">Livreurs →</Link>
          {' · '}
          <Link to="/admin/cities">Zones villes →</Link>
        </p>
      </header>

      <div className="adm-hub-kpis">
        <div className="adm-hub-kpi">
          <strong>{deliveries.length}</strong>
          <span>Livraisons actives</span>
        </div>
        <div className="adm-hub-kpi adm-hub-kpi--warn">
          <strong>{delayed.length}</strong>
          <span>Retards &gt; 15 min</span>
        </div>
        <div className="adm-hub-kpi">
          <strong>{DEMO_ADMIN_REGIONS.length}</strong>
          <span>Zones régionales</span>
        </div>
      </div>

      {loading ? (
        <p className="adm-muted">Chargement…</p>
      ) : (
        <>
          <section className="adm-card">
            <h3><Clock size={18} /> Livraisons en cours — chaîne du froid</h3>
            <DeliveryColdChainPanel role="admin" title="Livraisons actives — GPS & capteurs" />
          </section>

          <section className="adm-card" style={{ marginTop: 16 }}>
            <h3><MapPin size={18} /> Zones de livraison</h3>
            <ul className="adm-zone-list">
              {DEMO_ADMIN_REGIONS.map((r) => (
                <li key={r}>
                  <MapPin size={14} />
                  {r}
                  <span className="adm-zone-list__badge">Active</span>
                </li>
              ))}
            </ul>
            <Link to="/admin/cities" className="adm-btn adm-btn--ghost adm-btn--sm" style={{ marginTop: 12 }}>
              Configurer le réseau villes →
            </Link>
          </section>

          {delayed.length > 0 && (
            <section className="adm-banner adm-banner--warn" style={{ marginTop: 16 }}>
              <AlertTriangle size={18} />
              <div>
                <strong>{delayed.length} livraison(s) en retard</strong>
                <p>Vérifiez le GPS livreur et les capteurs température.</p>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDeliveryOpsPage;
