import React from 'react';
import { AlertTriangle, Brain } from 'lucide-react';

const LivreurOrderMlBadge = ({ risk, priority, compact = false }) => {
  if (!risk && !priority) return null;

  const cancelRisk = risk?.cancelRisk ?? priority?.cancelRisk;
  if (cancelRisk == null) return null;

  const pct = Math.round(cancelRisk * 100);
  const high = risk?.highRisk ?? priority?.highRisk ?? cancelRisk >= 0.45;
  const medium = !high && cancelRisk >= 0.3;

  const bg = high ? '#fef2f2' : medium ? '#fffbeb' : '#ecfdf5';
  const color = high ? '#b91c1c' : medium ? '#b45309' : '#047857';
  const border = high ? '#fecaca' : medium ? '#fde68a' : '#a7f3d0';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        padding: compact ? '2px 6px' : '4px 8px',
        borderRadius: 8,
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
      title={priority?.recommendation || `Risque annulation ${pct}%`}
    >
      {high ? <AlertTriangle size={compact ? 10 : 12} /> : <Brain size={compact ? 10 : 12} />}
      IA {pct}%
      {priority?.priorityScore != null && !compact && (
        <span style={{ opacity: 0.85 }}>· prio {priority.priorityScore}</span>
      )}
    </span>
  );
};

export default LivreurOrderMlBadge;
