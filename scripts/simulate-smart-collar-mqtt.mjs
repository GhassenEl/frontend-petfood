#!/usr/bin/env node
/**
 * Simulateur collier intelligent via MQTT (température, humidité, FC).
 *
 * Usage :
 *   node scripts/simulate-smart-collar-mqtt.mjs
 *   node scripts/simulate-smart-collar-mqtt.mjs --device-key pc_sim_max --interval 5
 */
import mqtt from 'mqtt';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BROKER = getArg('--broker', process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');
const PREFIX = String(getArg('--prefix', process.env.MQTT_TOPIC_PREFIX || 'petfood/')).replace(/\/?$/, '/');
const DEVICE_KEY = getArg('--device-key', process.env.DEVICE_KEY || 'pc_sim_max');
const DEVICE_ID = getArg('--device-id', process.env.DEVICE_ID || DEVICE_KEY);
const INTERVAL_SEC = Number(getArg('--interval', '5'));

const topicTelemetry = `${PREFIX}collar/${DEVICE_ID}/telemetry`;

let battery = 80;
let tick = 0;

const client = mqtt.connect(BROKER, {
  clientId: `sim-collar-${Math.random().toString(16).slice(2, 8)}`,
  reconnectPeriod: 2000,
});

client.on('connect', () => {
  console.log(`✅ Collier sim connecté — ${topicTelemetry}`);
  setInterval(() => {
    tick += 1;
    battery = Math.max(5, battery - 0.05);
    const payload = {
      deviceKey: DEVICE_KEY,
      deviceId: DEVICE_ID,
      temperatureC: Math.round((38.2 + Math.sin(tick / 5) * 0.4 + Math.random() * 0.2) * 10) / 10,
      humidityPct: Math.round(48 + Math.sin(tick / 7) * 8 + Math.random() * 2),
      heartRateBpm: Math.round(90 + Math.sin(tick / 3) * 12 + Math.random() * 5),
      ambientTempC: Math.round((23.5 + Math.random()) * 10) / 10,
      batteryPercent: Math.round(battery * 10) / 10,
      firmwareVersion: 'collar-sim-1.0',
    };
    client.publish(topicTelemetry, JSON.stringify(payload));
    console.log(`📡 #${tick}`, payload);
  }, INTERVAL_SEC * 1000);
});

client.on('error', (err) => console.error('MQTT error:', err.message));
