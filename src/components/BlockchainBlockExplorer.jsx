import React, { useState } from 'react';
import { Copy, Link2, Shield, Cpu } from 'lucide-react';
import { enrichSupplyChainBlocks } from '../utils/blockchainEngine';
import '../pages/ClientTraceability.css';

const shortHash = (h) => (h && h.length > 16 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h || '—');

const BlockchainBlockExplorer = ({ steps = [], valid, merkleRoot, iotAnchor, onCopyHash }) => {
  const blocks = enrichSupplyChainBlocks(steps);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="bc-explorer">
      {blocks.map((block, i) => {
        const isLast = i === blocks.length - 1;
        const broken = !valid && i > 0 && block.prevHash && block.prevHash !== blocks[i - 1]?.hash;
        const isOpen = expanded === i;

        return (
          <div
            key={`${block.hash || i}-${block.step}`}
            className={`bc-block${broken ? ' bc-block--invalid' : ''}`}
          >
            {!isLast && <div className="bc-block__connector" aria-hidden />}
            <div className="bc-block__node">{i + 1}</div>
            <div className="bc-block__card">
              <div className="bc-block__head">
                <div>
                  <p className="bc-block__title">{block.label || block.step}</p>
                  <p className="bc-block__meta">
                    {block.location} — {block.actor}
                  </p>
                  <p className="bc-block__meta">
                    {block.timestamp ? new Date(block.timestamp).toLocaleString('fr-FR') : '—'}
                  </p>
                </div>
                <span className="bc-block__badge">Bloc #{block.blockIndex ?? i}</span>
              </div>

              {block.prevHash && (
                <p className="bc-block__prev">
                  ← prev: {shortHash(block.prevHash)}
                </p>
              )}

              <div className="bc-block__hash">
                <Link2 size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {isOpen ? block.hash : shortHash(block.hash)}
                <button
                  type="button"
                  className="bc-block__copy"
                  onClick={() => onCopyHash?.(block.hash)}
                  title="Copier hash"
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  className="bc-block__copy"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  title={isOpen ? 'Réduire' : 'Voir hash complet'}
                  style={{ fontSize: 10, fontWeight: 700 }}
                >
                  {isOpen ? '−' : '+'}
                </button>
              </div>

              {block.dataPayload && (
                <p style={{ margin: '8px 0 0', fontSize: 11, color: '#64748b' }}>
                  Données : {block.dataPayload}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {merkleRoot && (
        <div className="bc-merkle">
          <h4><Shield size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Racine Merkle</h4>
          <p className="bc-merkle__root">{merkleRoot}</p>
        </div>
      )}

      {iotAnchor && (
        <div className="bc-iot-anchor">
          <div className="bc-iot-anchor__title">
            <Cpu size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Ancrage IoT PetFoodIoT
          </div>
          <div className="bc-iot-anchor__row">
            <span>Appareil</span>
            <span>{iotAnchor.deviceId || 'ESP32-CAM'}</span>
          </div>
          <div className="bc-iot-anchor__row">
            <span>Qualité alimentaire</span>
            <span style={{ color: iotAnchor.qualityScore >= 50 ? '#4ade80' : '#f87171' }}>
              {iotAnchor.qualityScore}%
            </span>
          </div>
          <div className="bc-iot-anchor__row">
            <span>Tx ancrage</span>
            <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{shortHash(iotAnchor.txHash)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainBlockExplorer;
