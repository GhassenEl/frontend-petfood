import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { fetchSupportComplaints } from '../services/supportService';
import './SupportPages.css';

const SupportComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchSupportComplaints();
    setComplaints(data.complaints || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="sup-page">
      <header className="sup-hero">
        <h1><AlertTriangle size={24} /> Réclamations {demo && <span className="sup-demo-pill">Mode démo</span>}</h1>
        <p>Gérer les réclamations clients en attente de traitement.</p>
      </header>
      <div className="sup-card">
        {loading ? <p className="sup-empty">Chargement…</p> : (
          <table className="sup-table">
            <thead><tr><th>Client</th><th>Sujet</th><th>Priorité</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id || c._id}>
                  <td>{c.clientName || c.userName || '—'}</td>
                  <td>{c.subject || c.message?.slice(0, 60)}</td>
                  <td><span className={`sup-badge sup-badge--${c.priority || 'medium'}`}>{c.priority || 'medium'}</span></td>
                  <td>{c.status}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SupportComplaintsPage;
