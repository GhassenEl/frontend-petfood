import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Cpu } from 'lucide-react';
import IoTDeviceCard from './IoTDeviceCard';
import { auditFirmware } from '../utils/iotEcosystemEngine';
import { IOT_SETUP_STEPS } from '../config/iotEcosystemCatalog';

const IoTDevicesRegistryPanel = ({ devices = [], demoMode }) => {
  const firmware = auditFirmware(devices);
  const outdated = firmware.filter((f) => !f.upToDate).length;

  return (
    <section className="iot-registry">
      <header className="iot-registry__head">
        <div>
          <h3>Appareils connectés</h3>
          <p>
            {devices.length} appareil{devices.length > 1 ? 's' : ''} —
            {devices.filter((d) => d.status === 'online').length} en ligne
            {outdated > 0 && ` · ${outdated} mise(s) à jour disponible(s)`}
          </p>
        </div>
        <Link to="/pet-feeder" className="iot-registry__add">
          <Plus size={16} /> Ajouter
        </Link>
      </header>

      <div className="iot-devices-grid">
        {devices.map((d) => (
          <IoTDeviceCard key={d.id} device={d} />
        ))}
      </div>

      {firmware.length > 0 && (
        <div className="iot-registry__firmware">
          <h4>Firmware &amp; versions</h4>
          <div className="iot-registry__fw-table-wrap">
            <table className="iot-registry__fw-table">
              <thead>
                <tr>
                  <th>Appareil</th>
                  <th>Version</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {firmware.map((f) => (
                  <tr key={f.deviceId}>
                    <td>{f.deviceName}</td>
                    <td><code>{f.current}</code></td>
                    <td>
                      <span className={`iot-registry__fw-badge${f.upToDate ? ' iot-registry__fw-badge--ok' : ''}`}>
                        {f.upToDate ? '✓ À jour' : '⬆ Mise à jour'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <details className="iot-registry__setup">
        <summary>
          <Cpu size={16} /> Guide de configuration ESP32
          {demoMode && <span className="iot-registry__demo-pill">Démo</span>}
        </summary>
        <ol className="iot-registry__steps">
          {IOT_SETUP_STEPS.map((s) => (
            <li key={s.step}>
              <strong>{s.title}</strong>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
};

export default IoTDevicesRegistryPanel;
