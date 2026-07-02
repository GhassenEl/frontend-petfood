import React from 'react';
import { EMBEDDED_SENSORS } from '../config/embeddedPlatformCatalog';

const demoValues = {
  hx711: { v: 142, status: 'ok' },
  hcsr04: { v: 18, status: 'ok' },
  ir: { v: 1, status: 'ok' },
  dht11: { v: '24°C / 52%', status: 'ok' },
  servo: { v: 90, status: 'ok' },
  motor: { v: 0, status: 'idle' },
  cam: { v: 'QVGA 15fps', status: 'live' },
  oled: { v: 'OK 94%', status: 'ok' },
  lcd: { v: 'PetfoodTN', status: 'ok' },
};

const EmbeddedSensorsMatrix = ({ devices = [] }) => {
  const feederOnline = devices.some((d) => d.type === 'feeder' && d.status === 'online');
  const camOnline = devices.some((d) => d.type === 'feeder-cam' && d.status === 'online');

  const isActive = (sensor) => {
    if (sensor.firmware.includes('CAM')) return camOnline;
    return feederOnline;
  };

  return (
    <section className="embedded-sensors">
      <h3 className="embedded-sensors__title">Matrice capteurs & actionneurs</h3>
      <p className="embedded-sensors__desc">
        GPIO ESP32 mappés sur PCB PF-TN-CTRL — lecture temps réel ou simulation démo.
      </p>
      <div className="embedded-sensors__grid">
        {EMBEDDED_SENSORS.map((s) => {
          const active = isActive(s);
          const demo = demoValues[s.id] || { v: '—', status: 'off' };
          return (
            <article
              key={s.id}
              className={`embedded-sensors__card${active ? ' is-live' : ''}`}
            >
              <div className="embedded-sensors__card-head">
                <span className="embedded-sensors__icon">{s.icon}</span>
                <div>
                  <strong>{s.label}</strong>
                  <span className="embedded-sensors__gpio">GPIO {s.gpio}</span>
                </div>
                <span className={`embedded-sensors__pill embedded-sensors__pill--${active ? demo.status : 'off'}`}>
                  {active ? demo.status : 'offline'}
                </span>
              </div>
              <p className="embedded-sensors__value">{active ? demo.v : '—'} <small>{s.unit}</small></p>
              <p className="embedded-sensors__meta">{s.firmware} · {s.range}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default EmbeddedSensorsMatrix;
