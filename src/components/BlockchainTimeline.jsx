import React from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';

const BlockchainTimeline = ({ steps = [], valid }) => (
  <div style={{ position: 'relative', paddingLeft: 28 }}>
    {steps.map((s, i) => {
      const isLast = i === steps.length - 1;
      return (
        <div key={`${s.hash || i}-${s.label}`} style={{ position: 'relative', paddingBottom: isLast ? 0 : 24 }}>
          {!isLast && (
            <div style={{
              position: 'absolute',
              left: -20,
              top: 22,
              bottom: 0,
              width: 2,
              background: valid ? 'linear-gradient(#0d9488, #7c3aed)' : '#fca5a5',
            }}
            />
          )}
          <div style={{
            position: 'absolute',
            left: -28,
            top: 4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: valid ? '#ecfdf5' : '#fef2f2',
            border: `2px solid ${valid ? '#0d9488' : '#dc2626'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          >
            <CheckCircle2 size={10} color={valid ? '#0d9488' : '#dc2626'} />
          </div>
          <div style={{
            background: '#f8fafc',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid #e2e8f0',
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <strong style={{ fontSize: 14 }}>{s.label || s.step}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569' }}>
                  {s.location} — {s.actor}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  {s.timestamp ? new Date(s.timestamp).toLocaleString('fr-FR') : '—'}
                </p>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                background: '#f0fdfa',
                color: '#0f766e',
              }}
              >
                Bloc {i + 1}
              </span>
            </div>
            {s.hash && (
              <p style={{ margin: '8px 0 0', fontSize: 10, color: '#0d9488', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Link2 size={10} /> {s.hash}
              </p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default BlockchainTimeline;
