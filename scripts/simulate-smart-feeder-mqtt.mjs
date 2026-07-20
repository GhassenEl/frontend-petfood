#!/usr/bin/env node
/**
 * Simulateur gamelle intelligente ESP32 via MQTT (sans matériel).
 *
 * Prérequis : broker Mosquitto (docker compose -f docker-compose.iot.yml up -d mqtt)
 *             backend avec MQTT_BROKER_URL=mqtt://localhost:1883
 *
 * Usage :
 *   node scripts/simulate-smart-feeder-mqtt.mjs
 *   node scripts/simulate-smart-feeder-mqtt.mjs --device-key pf_xxx --device-id uuid
 *   node scripts/simulate-smart-feeder-mqtt.mjs --scenario low-food --interval 5
 *   node scripts/simulate-smart-feeder-mqtt.mjs --broker mqtt://localhost:1883
 */

import mqtt from 'mqtt';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BROKER = getArg('--broker', process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');
const PREFIX = String(getArg('--prefix', process.env.MQTT_TOPIC_PREFIX || 'petfood/')).replace(/\/?$/, '/');
const DEVICE_KEY = getArg('--device-key', process.env.DEVICE_KEY || 'pf_sim_smart_bowl');
const DEVICE_ID = getArg('--device-id', process.env.DEVICE_ID || DEVICE_KEY);
const INTERVAL_SEC = Number(getArg('--interval', '5'));
const SCENARIO = getArg('--scenario', 'normal'); // normal | low-food | dispense-ack

const topicTelemetry = `${PREFIX}feeder/${DEVICE_ID}/telemetry`;
const topicAck = `${PREFIX}feeder/${DEVICE_ID}/ack`;
const topicCmd = `${PREFIX}feeder/${DEVICE_ID}/commands`;

let foodGrams = SCENARIO === 'low-food' ? 6 : 420;
let reservoirCm = SCENARIO === 'low-food' ? 29 : 12;
let tick = 0;

const client = mqtt.connect(BROKER, {
  clientId: `sim-feeder-${Math.random().toString(16).slice(2, 8)}`,
  reconnectPeriod: 2000,
});

const publishTelemetry = () => {
  tick += 1;
  if (SCENARIO === 'normal' && tick % 8 === 0) {
    foodGrams = Math.max(8, foodGrams - 18);
    reservoirCm = Math.min(30, reservoirCm + 1.5);
  }
  const payload = {
    deviceKey: DEVICE_KEY,
    deviceId: DEVICE_ID,
    firmwareVersion: 'sim-mqtt-1.0',
    reservoirCm: Number(reservoirCm.toFixed(1)),
    foodGrams: Number(foodGrams.toFixed(1)),
    temperature: 22 + Math.sin(tick / 5),
    humidity: 48 + (tick % 5),
    animalPresent: tick % 3 === 0,
    isLowFood: foodGrams < 10 || reservoirCm > 25,
    macAddress: 'AA:BB:CC:DD:EE:01',
  };
  client.publish(topicTelemetry, JSON.stringify(payload), { qos: 1 });
  console.log(
    `[${new Date().toLocaleTimeString('fr-FR')}] telemetry → ${topicTelemetry}`,
    `food=${payload.foodGrams}g reservoir=${payload.reservoirCm}cm low=${payload.isLowFood}`,
  );
};

client.on('connect', () => {
  console.log(`📡 Simulateur MQTT connecté (${BROKER})`);
  console.log(`   deviceId=${DEVICE_ID} key=${DEVICE_KEY}`);
  client.subscribe(topicCmd, { qos: 1 });
  publishTelemetry();
  setInterval(publishTelemetry, INTERVAL_SEC * 1000);

  if (SCENARIO === 'dispense-ack') {
    setTimeout(() => {
      const ack = {
        deviceKey: DEVICE_KEY,
        commandId: `sim-${Date.now()}`,
        success: true,
        portionGrams: 30,
        animalDetected: true,
        foodGrams,
        reservoirCm,
        message: 'Distribution simulée OK',
      };
      client.publish(topicAck, JSON.stringify(ack), { qos: 1 });
      console.log('✓ ack dispense publié');
    }, 2000);
  }
});

client.on('message', (topic, buf) => {
  let cmd;
  try {
    cmd = JSON.parse(String(buf));
  } catch {
    return;
  }
  console.log(`[cmd] ${topic}`, cmd);
  const grams = Number(cmd.grams || cmd.portionGrams || 30);
  foodGrams = Math.max(0, foodGrams - grams);
  const ack = {
    deviceKey: DEVICE_KEY,
    commandId: cmd.id || cmd.commandId || `ack-${Date.now()}`,
    success: foodGrams >= 0,
    portionGrams: grams,
    animalDetected: true,
    foodGrams,
    reservoirCm,
    message: `Sim ACK ${grams} g`,
  };
  client.publish(topicAck, JSON.stringify(ack), { qos: 1 });
  console.log('✓ ACK publié', ack.message);
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
});
