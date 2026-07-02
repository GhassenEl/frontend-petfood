import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Terminal, Wifi } from 'lucide-react';
import { EMBEDDED_FIRMWARE } from '../config/embeddedPlatformCatalog';
import { IOT_SETUP_STEPS } from '../config/iotEcosystemCatalog';

const EmbeddedFirmwarePanel = () => (
  <section className="embedded-firmware">
    <h3 className="embedded-firmware__title">Provisioning & firmware ESP32</h3>
    <div className="embedded-firmware__grid">
      {EMBEDDED_FIRMWARE.map((fw) => (
        <article key={fw.id} className="embedded-firmware__card">
          <header>
            <strong>{fw.name}</strong>
            <span>v{fw.version}</span>
          </header>
          <p className="embedded-firmware__path"><Terminal size={14} /> {fw.path}/</p>
          <ul>
            {fw.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <footer>
            <span>Build {fw.lastBuild}</span>
            {fw.otaAvailable && <span className="embedded-firmware__ota">OTA</span>}
          </footer>
        </article>
      ))}
    </div>

    <ol className="embedded-firmware__steps">
      {IOT_SETUP_STEPS.map((s) => (
        <li key={s.step}>
          <strong>{s.step}. {s.title}</strong>
          <p>{s.desc}</p>
        </li>
      ))}
    </ol>

    <div className="embedded-firmware__actions">
      <Link to="/pet-feeder" className="embedded-firmware__btn">
        <Wifi size={16} /> Créer un appareil
      </Link>
      <a href="/hardware/proteus/README.md" className="embedded-firmware__btn embedded-firmware__btn--ghost" download>
        <Download size={16} /> Docs hardware
      </a>
    </div>
  </section>
);

export default EmbeddedFirmwarePanel;
