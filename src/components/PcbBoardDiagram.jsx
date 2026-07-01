import React from 'react';

/**
 * Schéma visuel simplifié d'une carte PCB (zones + connecteurs).
 */
const PcbBoardDiagram = ({ board, highlightZone }) => {
  const w = 100;
  const h = board.id === 'power' ? 60 : 80;

  return (
    <div className="pcb-diagram-wrap">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="pcb-diagram"
        role="img"
        aria-label={`Schéma ${board.shortLabel}`}
      >
        <rect x="1" y="1" width={w - 2} height={h - 2} rx="3" className="pcb-diagram__edge" />
        <rect x="3" y="3" width={w - 6} height={h - 6} rx="2" className="pcb-diagram__copper" />

        {(board.zones || []).map((z) => (
          <g key={z.id}>
            <rect
              x={z.x}
              y={z.y}
              width={z.w}
              height={z.h}
              rx="2"
              className={`pcb-diagram__zone${highlightZone === z.id ? ' pcb-diagram__zone--active' : ''}`}
              style={{ '--zone-color': board.color }}
            />
            <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 1} className="pcb-diagram__zone-label">
              {z.label}
            </text>
          </g>
        ))}

        {(board.connectors || []).slice(0, 4).map((c, i) => (
          <circle
            key={c.id}
            cx={8 + i * 10}
            cy={h - 6}
            r="2.5"
            className="pcb-diagram__pad"
          />
        ))}
      </svg>
      <p className="pcb-diagram__ref">{board.ref} · {board.dimensions}</p>
    </div>
  );
};

export default PcbBoardDiagram;
