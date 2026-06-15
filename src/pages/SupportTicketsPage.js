import React, { useCallback, useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { fetchSupportTickets, updateSupportTicket } from '../services/supportService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './SupportPages.css';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved'];

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchSupportTickets();
    setTickets(data.tickets || []);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const changeStatus = async (id, status) => {
    await updateSupportTicket(id, { status });
    load();
  };

  return (
    <div className="sup-page">
      <header className="sup-hero">
        <h1><Ticket size={24} /> Tickets support {demo && <span className="sup-demo-pill">Mode démo</span>}</h1>
        <p>Suivre et mettre à jour les tickets d&apos;assistance.</p>
      </header>
      <div className="sup-card">
        {loading ? <p className="sup-empty">Chargement…</p> : tickets.length === 0 ? (
          <p className="sup-empty">Aucun ticket ouvert.</p>
        ) : (
          <table className="sup-table">
            <thead><tr><th>Sujet</th><th>Client</th><th>Canal</th><th>Priorité</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.subject}</td>
                  <td>{t.clientName}</td>
                  <td>{t.channel}</td>
                  <td><span className={`sup-badge sup-badge--${t.priority}`}>{t.priority}</span></td>
                  <td>{t.status}</td>
                  <td>
                    <select value={t.status} onChange={(e) => changeStatus(t.id, e.target.value)} className="sup-select">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;
