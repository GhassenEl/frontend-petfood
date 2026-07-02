import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, CircuitBoard, Radio, ChevronRight, Zap } from 'lucide-react';
import {
  EMBEDDED_STACK_LAYERS,
  EMBEDDED_FIRMWARE,
  buildEmbeddedStackSummary,
} from '../config/embeddedPlatformCatalog';
import { PCB_BOARDS } from '../config/pcbHardwareCatalog';

const EmbeddedStackPanel = ({ pack = {}, compact = false }) => {
  const summary = buildEmbeddedStackSummary(pack);

  return (
    <section className={`embedded-stack${compact ? ' embedded-stack--compact' : ''}`}>
      <div className="embedded-stack__header">
        <div>
          <p className="embedded-stack__kicker">Plateforme embarquée · Edge-first</p>
          <h2 className="embedded-stack__title">
            <Cpu size={22} /> Stack PetFoodIoT
          </h2>
          <p className="embedded-stack__subtitle">
            ESP32 · PCB ARES · MQTT · capteurs industriels — de la carte imprimée au dashboard live.
          </p>
        </div>
        <div className="embedded-stack__score" aria-label="Score dominance embarqué">
          <span className="embedded-stack__score-value">{summary.dominanceScore}</span>
          <span className="embedded-stack__score-label">Score edge</span>
        </div>
      </div>

      <div className="embedded-stack__metrics">
        <Metric label="Capteurs" value={summary.sensorCount} />
        <Metric label="Firmware" value={summary.firmwareBuilds} />
        <Metric label="Cartes PCB" value={summary.pcbBoards} />
        <Metric label="Topics MQTT" value={summary.mqttTopics} />
        <Metric label="En ligne" value={`${summary.devicesOnline}/${summary.devicesTotal || '—'}`} highlight />
        <Metric label="Latence edge" value={`${summary.edgeLatencyMs} ms`} />
      </div>

      <div className="embedded-stack__layers">
        {EMBEDDED_STACK_LAYERS.map((layer) => (
          <article key={layer.id} className="embedded-stack__layer" style={{ '--layer-color': layer.color }}>
            <div className="embedded-stack__layer-head">
              <span className="embedded-stack__layer-icon">{layer.icon}</span>
              <strong>{layer.label}</strong>
            </div>
            <ul className="embedded-stack__layer-list">
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {!compact && (
        <>
          <div className="embedded-stack__firmware">
            <h3><Zap size={18} /> Firmware embarqué</h3>
            <div className="embedded-stack__firmware-grid">
              {EMBEDDED_FIRMWARE.map((fw) => (
                <div key={fw.id} className="embedded-stack__fw-card">
                  <div className="embedded-stack__fw-head">
                    <strong>{fw.name}</strong>
                    <span className="embedded-stack__fw-ver">v{fw.version}</span>
                  </div>
                  <p className="embedded-stack__fw-mcu">{fw.mcu} · {fw.flash}</p>
                  <ul>
                    {fw.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  {fw.otaAvailable && <span className="embedded-stack__ota">OTA disponible</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="embedded-stack__pcb">
            <h3><CircuitBoard size={18} /> Cartes PCB</h3>
            <div className="embedded-stack__pcb-grid">
              {PCB_BOARDS.map((board) => (
                <Link key={board.id} to="/client-hardware-pcb" className="embedded-stack__pcb-card">
                  <span>{board.icon}</span>
                  <div>
                    <strong>{board.shortLabel}</strong>
                    <p>{board.ref} · {board.dimensions}</p>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          </div>

          <div className="embedded-stack__links">
            <Link to="/pet-feeder" className="embedded-stack__link">
              <Radio size={16} /> Distributeur ESP32 <ChevronRight size={14} />
            </Link>
            <Link to="/client-hardware-pcb" className="embedded-stack__link">
              <CircuitBoard size={16} /> Documentation PCB <ChevronRight size={14} />
            </Link>
            <Link to="/client-iot?tab=food-quality" className="embedded-stack__link">
              <Cpu size={16} /> ESP32-CAM qualité <ChevronRight size={14} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

const Metric = ({ label, value, highlight }) => (
  <div className={`embedded-stack__metric${highlight ? ' embedded-stack__metric--hi' : ''}`}>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

export default EmbeddedStackPanel;
