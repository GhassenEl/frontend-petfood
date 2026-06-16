import React, { useState } from 'react';
import { Users } from 'lucide-react';

const ClientSegmentationPanel = ({ segmentation, loading }) => {
  const [activeId, setActiveId] = useState(null);

  if (loading) {
    return <p className="bi-loading">Segmentation des clients en cours…</p>;
  }

  const segments = segmentation?.segments || [];
  if (!segments.length) {
    return <p className="bi-empty">Aucune donnée client disponible.</p>;
  }

  const active = activeId ? segments.find((s) => s.id === activeId) : segments[0];

  return (
    <div className="bi-segment">
      <p className="bi-summary">
        {segmentation.totalClients} clients analysés — classification RFM (recency, frequency, monetary).
      </p>
      <div className="bi-segment-grid">
        {segments.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`bi-segment-card ${active?.id === s.id ? 'is-active' : ''}`}
            style={{ borderColor: s.color }}
            onClick={() => setActiveId(s.id)}
          >
            <Users size={18} aria-hidden style={{ color: s.color }} />
            <strong>{s.label}</strong>
            <span>{s.count} clients</span>
            <small>{s.revenue} DT CA</small>
          </button>
        ))}
      </div>
      {active && (
        <ul className="bi-client-list">
          {active.clients.slice(0, 8).map((c) => (
            <li key={c.email}>
              <strong>{c.name || c.email}</strong>
              <span>{c.orderCount} cmd · {c.totalSpent} DT</span>
              <small>{c.topCategory} · {c.daysSinceLast} j depuis dernière cmd</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientSegmentationPanel;
