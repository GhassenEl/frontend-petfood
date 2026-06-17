import React from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';
import { enrichSupplyChainBlocks } from '../utils/blockchainEngine';
import '../pages/ClientTraceability.css';

/** Timeline blockchain compacte (legacy + enrichie). */
const BlockchainTimeline = ({ steps = [], valid }) => {
  const blocks = enrichSupplyChainBlocks(steps);

  return (
    <div className="bc-explorer">
      {blocks.map((s, i) => {
        const isLast = i === blocks.length - 1;
        return (
          <div key={`${s.hash || i}-${s.label}`} className={`bc-block${!valid ? ' bc-block--invalid' : ''}`}>
            {!isLast && <div className="bc-block__connector" aria-hidden />}
            <div className="bc-block__node">
              <CheckCircle2 size={10} color={valid ? '#0d9488' : '#dc2626'} />
            </div>
            <div className="bc-block__card">
              <div className="bc-block__head">
                <div>
                  <strong className="bc-block__title">{s.label || s.step}</strong>
                  <p className="bc-block__meta">{s.location} — {s.actor}</p>
                  <p className="bc-block__meta">
                    {s.timestamp ? new Date(s.timestamp).toLocaleString('fr-FR') : '—'}
                  </p>
                </div>
                <span className="bc-block__badge">Bloc {i + 1}</span>
              </div>
              {s.hash && (
                <p className="bc-block__hash">
                  <Link2 size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {s.hash}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BlockchainTimeline;
