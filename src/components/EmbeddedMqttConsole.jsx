import React, { useMemo } from 'react';
import { Radio, Wifi } from 'lucide-react';
import { MQTT_TOPIC_SCHEMA } from '../config/embeddedPlatformCatalog';

const EmbeddedMqttConsole = ({ pack = {} }) => {
  const mqtt = pack.mqtt || {};
  const deviceId = pack.devices?.[0]?.id || 'feeder-demo-01';

  const messages = useMemo(() => MQTT_TOPIC_SCHEMA.map((t, i) => {
    const topic = t.topic.replace('{id}', deviceId);
    const payloads = [
      '{"online":true,"grams":142,"reservoir":68}',
      '{"cmd":"dispense","grams":30}',
      '{"weight":142.3,"temp":24.1,"hum":52}',
      '{"frame":"rgb565","ts":1710000000}',
      '{"score":94,"quality":"good","temp":23.8}',
      '{"ml":180,"target":250}',
      '{"activeUsers":3}',
    ];
    return {
      ...t,
      topic,
      payload: payloads[i % payloads.length],
      ago: `${12 + i * 7}s`,
    };
  }), [deviceId]);

  return (
    <section className="embedded-mqtt">
      <div className="embedded-mqtt__head">
        <h3><Radio size={18} /> Console MQTT</h3>
        <div className="embedded-mqtt__broker">
          <Wifi size={14} />
          <span>{mqtt.broker || 'mqtt://localhost:1883'}</span>
          <span className={`embedded-mqtt__status${mqtt.connected ? ' is-on' : ''}`}>
            {mqtt.connected ? 'Connecté' : 'Hors ligne'}
          </span>
        </div>
      </div>
      <div className="embedded-mqtt__table-wrap">
        <table className="embedded-mqtt__table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>QoS</th>
              <th>Dir</th>
              <th>Dernier message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.topic}>
                <td><code>{m.topic}</code></td>
                <td>{m.qos}</td>
                <td><span className={`embedded-mqtt__dir embedded-mqtt__dir--${m.dir}`}>{m.dir}</span></td>
                <td>
                  <code className="embedded-mqtt__payload">{m.payload}</code>
                  <span className="embedded-mqtt__ago">il y a {m.ago}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="embedded-mqtt__hint">
        Broker Mosquitto : <code>npm run docker:iot:up</code> — topics définis dans <code>infra/mqtt/mosquitto.conf</code>
      </p>
    </section>
  );
};

export default EmbeddedMqttConsole;
