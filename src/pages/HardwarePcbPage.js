import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Cpu, Zap, Download, ArrowLeft, CircuitBoard, Layers } from 'lucide-react';
import PcbBoardDiagram from '../components/PcbBoardDiagram';
import {
  PCB_BOARDS,
  ARES_WORKFLOW_STEPS,
  GERBER_LAYERS,
  HARDWARE_DOWNLOADS,
  getPcbBoard,
} from '../config/pcbHardwareCatalog';
import './HardwarePcbPage.css';

const MetaGrid = ({ items }) => (
  <dl className="hardware-pcb-meta">
    {items.map(({ label, value }) => (
      <div key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    ))}
  </dl>
);

const BomTable = ({ rows }) => (
  <table className="hardware-pcb-table">
    <thead>
      <tr>
        <th>Réf.</th>
        <th>Composant</th>
        <th>Qté</th>
        <th>Boîtier</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={`${row.ref}-${row.part}`}>
          <td><strong>{row.ref}</strong></td>
          <td>{row.part}</td>
          <td>{row.qty}</td>
          <td>{row.package}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const HardwarePcbPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const boardId = searchParams.get('board') || 'main';
  const board = getPcbBoard(boardId);
  const [zone, setZone] = useState(null);
  const downloads = HARDWARE_DOWNLOADS[board.id] || HARDWARE_DOWNLOADS.main;

  const selectBoard = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('board', id);
    setSearchParams(next);
    setZone(null);
  };

  const metaItems = [
    { label: 'Référence', value: board.ref },
    { label: 'Dimensions', value: board.dimensions },
    { label: 'Couches', value: board.layers },
    { label: 'Épaisseur', value: board.thickness },
    { label: 'Finition', value: board.finish },
    { label: 'Projet ARES', value: board.aresBoard },
  ];

  return (
    <div className="hardware-pcb-page">
      <Link to="/client-iot" className="hardware-pcb-link" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Centre IoT
      </Link>

      <header className="hardware-pcb-hero">
        <h1>
          <CircuitBoard size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Cartes PCB — Distributeur PetfoodTN
        </h1>
        <p>
          Documentation intégrée pour la <strong>carte PCB imprimée de contrôle</strong> (ESP32, capteurs, actionneurs)
          et la <strong>carte d&apos;alimentation 5 V</strong>. Conception Proteus ISIS → routage ARES → export Gerber.
        </p>
        <div className="hardware-pcb-stats">
          <div className="hardware-pcb-stat"><strong>2</strong><span>Cartes</span></div>
          <div className="hardware-pcb-stat"><strong>ARES</strong><span>Layout PCB</span></div>
          <div className="hardware-pcb-stat"><strong>Gerber</strong><span>Prêt fabrication</span></div>
          <div className="hardware-pcb-stat"><strong>ESP32</strong><span>Firmware lié</span></div>
        </div>
      </header>

      <div className="hardware-pcb-tabs" role="tablist">
        {PCB_BOARDS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={board.id === b.id}
            className={`hardware-pcb-tab${board.id === b.id ? ' hardware-pcb-tab--active' : ''}`}
            style={{ '--tab-color': b.color }}
            onClick={() => selectBoard(b.id)}
          >
            <strong>{b.icon} {b.shortLabel}</strong>
            <span>{b.ref}</span>
          </button>
        ))}
      </div>

      <div className="hardware-pcb-grid">
        <section className="hardware-pcb-card">
          <h2 style={{ color: board.color }}>
            {board.id === 'main' ? <Cpu size={20} /> : <Zap size={20} />}
            {board.label}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>{board.role}</p>

          <PcbBoardDiagram board={board} highlightZone={zone} />

          <MetaGrid items={metaItems} />

          {board.specs && (
            <>
              <h3>Spécifications électriques</h3>
              <MetaGrid items={board.specs.map((s) => ({ label: s.label, value: s.value }))} />
            </>
          )}

          {board.designRules && (
            <>
              <h3>Règles de design (ARES)</h3>
              <MetaGrid items={Object.entries(board.designRules).map(([k, v]) => ({
                label: k.replace(/([A-Z])/g, ' $1'),
                value: v,
              }))} />
            </>
          )}

          <div className="hardware-pcb-link-row">
            <Link to="/pet-feeder" className="hardware-pcb-link">Distributeur IoT →</Link>
            <a
              href="https://www.labcenter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hardware-pcb-link"
            >
              Proteus / ARES
            </a>
          </div>
        </section>

        <section className="hardware-pcb-card">
          <h2><Layers size={20} /> Connectique &amp; nomenclature</h2>

          <h3>Connecteurs</h3>
          <table className="hardware-pcb-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Fonction</th>
                <th>Broches</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {board.connectors.map((c) => (
                <tr
                  key={c.id}
                  onMouseEnter={() => setZone(c.id.toLowerCase())}
                  onMouseLeave={() => setZone(null)}
                >
                  <td><strong>{c.id}</strong></td>
                  <td>{c.label}</td>
                  <td>{c.pins}</td>
                  <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Nomenclature (BOM)</h3>
          <BomTable rows={board.bom} />

          {board.gpioMap && (
            <>
              <h3>Brochage ESP32 (GPIO)</h3>
              <table className="hardware-pcb-table">
                <thead>
                  <tr>
                    <th>GPIO</th>
                    <th>Signal</th>
                    <th>Dir.</th>
                  </tr>
                </thead>
                <tbody>
                  {board.gpioMap.map((g) => (
                    <tr key={g.gpio}>
                      <td><strong>{g.gpio}</strong></td>
                      <td>{g.signal}</td>
                      <td>{g.dir}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      </div>

      <div className="hardware-pcb-interconnect">
        <strong>Liaison entre les deux cartes :</strong>{' '}
        La sortie <code>J2</code> de la carte PSU (5 V / 3 A) alimente l&apos;entrée <code>J1</code> de la PCB contrôle.
        L&apos;ESP32 régule en 3,3 V via AMS1117 pour la logique ; le rail 5 V alimente servo, moteur et relais.
        Voir <code>firmware/README.md</code> et <code>firmware/esp32/PetFeederESP32/</code>.
      </div>

      <div className="hardware-pcb-grid" style={{ marginTop: 20 }}>
        <section className="hardware-pcb-card">
          <h2>Workflow Proteus ARES</h2>
          <ol className="hardware-pcb-workflow">
            {ARES_WORKFLOW_STEPS.map((s) => (
              <li key={s.step}>
                <div>
                  <strong>{s.title}</strong>
                  {s.detail}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="hardware-pcb-card">
          <h2><Download size={18} style={{ verticalAlign: 'middle' }} /> Téléchargements</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px' }}>
            Fichiers Proteus et Gerber démo — exécutez <code>npm run hardware:package</code> pour régénérer les ZIP.
          </p>
          <div className="hardware-pcb-downloads">
            <a href={downloads.proteusProject} download className="hardware-pcb-download hardware-pcb-download--primary">
              <Download size={16} /> Projet Proteus (.pdsprj)
            </a>
            <a href={downloads.gerberZip} download className="hardware-pcb-download">
              <Download size={16} /> Gerber ZIP ({board.gerberPrefix})
            </a>
            <a href={downloads.netlist} download className="hardware-pcb-download">
              <Download size={16} /> Netlist Tango (.net)
            </a>
            <a href={downloads.bom} download className="hardware-pcb-download">
              <Download size={16} /> BOM (.csv)
            </a>
          </div>

          <h3 style={{ marginTop: 20 }}>Calques Gerber</h3>
          <table className="hardware-pcb-table">
            <thead>
              <tr>
                <th>Calque</th>
                <th>Extension</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {GERBER_LAYERS.map((g) => (
                <tr key={g.ext}>
                  <td>{g.layer}</td>
                  <td><code>{g.ext}</code></td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{g.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 14, fontSize: '0.82rem', color: '#64748b' }}>
            Dépôt : <code>{downloads.repoGerber}</code> · Proteus : <code>{downloads.repoProteus}</code>
            {' '}— projet ISIS : <code>{board.proteusProject}</code>
          </p>
        </section>
      </div>
    </div>
  );
};

export default HardwarePcbPage;
