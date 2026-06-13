import React, { useCallback, useEffect, useState } from 'react';
import { Headphones } from 'lucide-react';
import { fetchSupportAssistQueue } from '../services/supportService';
import './SupportPages.css';

const SupportAssistPage = () => {
  const [queue, setQueue] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchSupportAssistQueue();
    setQueue(data.queue || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const takeCall = (id) => {
    window.alert(`Prise en charge client #${id} — démo : ouverture du chat / appel.`);
  };

  return (
    <div className="sup-page">
      <header className="sup-hero">
        <h1><Headphones size={24} /> Assistance en direct {demo && <span className="sup-demo-pill">Mode démo</span>}</h1>
        <p>File d&apos;attente des clients demandant une assistance immédiate.</p>
      </header>
      <div className="sup-card">
        {loading ? <p className="sup-empty">Chargement…</p> : queue.length === 0 ? (
          <p className="sup-empty">Aucun client en attente.</p>
        ) : (
          <ul className="sup-queue">
            {queue.map((q) => (
              <li key={q.id} className="sup-queue-item">
                <div>
                  <strong>{q.clientName}</strong>
                  <p>{q.topic}</p>
                  <small>{q.channel} — attente {q.waitingMin} min</small>
                </div>
                <button type="button" className="sup-btn sup-btn--primary" onClick={() => takeCall(q.id)}>
                  Prendre en charge
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SupportAssistPage;
