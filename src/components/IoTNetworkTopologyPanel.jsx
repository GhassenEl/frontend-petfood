import React from 'react';
import { IOT_NETWORK_LAYERS, IOT_PROTOCOLS } from '../config/iotEcosystemCatalog';

const IoTNetworkTopologyPanel = ({ networkHealth, mqtt }) => {
  const health = networkHealth || {};

  return (
    <section className="iot-topology">
      <header className="iot-topology__head">
        <h3>Architecture réseau IoT</h3>
        <div className="iot-topology__health">
          <strong style={{ color: health.score >= 70 ? '#059669' : '#d97706' }}>
            {health.score ?? '—'}/100
          </strong>
          <span>Santé réseau</span>
        </div>
      </header>

      <div className="iot-topology__layers">
        {IOT_NETWORK_LAYERS.map((layer, i) => (
          <React.Fragment key={layer.id}>
            <div className="iot-topology__layer">
              <span className="iot-topology__layer-icon">{layer.icon}</span>
              <div>
                <strong>{layer.label}</strong>
                <div className="iot-topology__chips">
                  {layer.items.map((item) => (
                    <span key={item} className="iot-topology__chip">{item}</span>
                  ))}
                </div>
              </div>
            </div>
            {i < IOT_NETWORK_LAYERS.length - 1 && (
              <div className="iot-topology__arrow" aria-hidden>↓</div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="iot-topology__protocols">
        {IOT_PROTOCOLS.map((p) => (
          <div key={p.id} className="iot-topology__proto">
            <span>{p.icon}</span>
            <div>
              <strong>{p.label}</strong>
              <small>{p.desc}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="iot-topology__status">
        <span className={mqtt?.connected ? 'iot-topology__pill iot-topology__pill--on' : 'iot-topology__pill'}>
          MQTT {mqtt?.connected ? 'connecté' : 'hors ligne'}
        </span>
        <span className={health.avgSignal >= 50 ? 'iot-topology__pill iot-topology__pill--on' : 'iot-topology__pill'}>
          Signal moy. {health.avgSignal ?? '—'}%
        </span>
        {health.latencyMs != null && (
          <span className="iot-topology__pill iot-topology__pill--on">
            Latence {health.latencyMs} ms
          </span>
        )}
        <span className="iot-topology__pill iot-topology__pill--on">
          {health.online ?? 0}/{health.total ?? 0} en ligne
        </span>
      </div>
    </section>
  );
};

export default IoTNetworkTopologyPanel;
