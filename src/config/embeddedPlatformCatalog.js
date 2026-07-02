/**
 * Catalogue plateforme embarquée — firmware, PCB, capteurs, MQTT.
 * Pilier différenciant PetfoodTN (edge → cloud).
 */
import { PCB_BOARDS } from './pcbHardwareCatalog';

export const EMBEDDED_STACK_LAYERS = [
  {
    id: 'edge',
    label: 'Edge — ESP32',
    icon: '🔌',
    color: '#059669',
    items: ['PetFeederESP32', 'PetFoodQualityESP32CAM', 'HX711 · HC-SR04 · DHT11', 'Servo · Moteur DC'],
  },
  {
    id: 'pcb',
    label: 'Hardware PCB',
    icon: '🟢',
    color: '#0d9488',
    items: ['PF-TN-CTRL-v1', 'PF-TN-PSU-5V-v1', 'Gerber · BOM · ARES'],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: '📡',
    color: '#2563eb',
    items: ['MQTT Mosquitto', 'Wi-Fi 2.4 GHz', 'REST /feeder', 'Socket.IO iot:*'],
  },
  {
    id: 'cloud',
    label: 'Cloud PetfoodTN',
    icon: '☁️',
    color: '#7c3aed',
    items: ['API Node.js', 'PostgreSQL', 'FastAPI ML', 'Firebase télémétrie'],
  },
  {
    id: 'client',
    label: 'Interfaces',
    icon: '📱',
    color: '#dc2626',
    items: ['Centre IoT web', 'Flutter mobile', 'Push alertes', 'OLED + LCD'],
  },
];

export const EMBEDDED_SENSORS = [
  { id: 'hx711', label: 'Balance HX711', icon: '⚖️', gpio: '33/4', unit: 'g', range: '0–5000', firmware: 'PetFeederESP32' },
  { id: 'hcsr04', label: 'Ultrason HC-SR04', icon: '📏', gpio: '5/18', unit: 'cm', range: '2–400', firmware: 'PetFeederESP32' },
  { id: 'ir', label: 'Capteur IR niveau', icon: '🔴', gpio: '19', unit: 'bool', range: '0/1', firmware: 'PetFeederESP32' },
  { id: 'dht11', label: 'DHT11 Temp/Hum', icon: '🌡️', gpio: '23', unit: '°C/%', range: '0–50°C', firmware: 'PetFeederESP32' },
  { id: 'servo', label: 'Servo SG90', icon: '🔄', gpio: '13', unit: '°', range: '0–180', firmware: 'PetFeederESP32' },
  { id: 'motor', label: 'Moteur DC + relais', icon: '⚙️', gpio: '14', unit: 'PWM', range: '0–100%', firmware: 'PetFeederESP32' },
  { id: 'cam', label: 'OV2640 ESP32-CAM', icon: '📷', gpio: 'CAM', unit: 'RGB565', range: 'QVGA', firmware: 'PetFoodQualityESP32CAM' },
  { id: 'oled', label: 'OLED SSD1306', icon: '🖥️', gpio: 'I2C', unit: 'px', range: '128×64', firmware: 'PetFoodQualityESP32CAM' },
  { id: 'lcd', label: 'LCD I2C 16×2', icon: '📟', gpio: '21/22', unit: 'chars', range: '16×2', firmware: 'PetFeederESP32' },
];

export const EMBEDDED_FIRMWARE = [
  {
    id: 'feeder',
    name: 'PetFeederESP32',
    version: '2.4.1',
    path: 'firmware/esp32/PetFeederESP32',
    mcu: 'ESP32-WROOM-32',
    flash: '4 Mo',
    features: ['HTTP heartbeat', 'MQTT telemetry', 'HX711 calibré', 'Planification cron'],
    otaAvailable: true,
    lastBuild: '2026-03-10',
  },
  {
    id: 'cam',
    name: 'PetFoodQualityESP32CAM',
    version: '1.8.3',
    path: 'firmware/esp32/PetFoodQualityESP32CAM',
    mcu: 'ESP32-CAM',
    flash: '4 Mo',
    features: ['Stream MJPEG', 'CNN qualité', 'OLED alertes', 'DHT11 ambiant'],
    otaAvailable: true,
    lastBuild: '2026-03-08',
  },
];

export const MQTT_TOPIC_SCHEMA = [
  { topic: 'petfood/feeder/{id}/status', qos: 1, dir: 'pub', desc: 'État distributeur (online, grams, reservoir)' },
  { topic: 'petfood/feeder/{id}/command', qos: 1, dir: 'sub', desc: 'Commandes dispense / calibrate / reboot' },
  { topic: 'petfood/feeder/{id}/telemetry', qos: 0, dir: 'pub', desc: 'Télémétrie HX711 + DHT11 (30 s)' },
  { topic: 'petfood/esp32cam/{id}/frame', qos: 0, dir: 'pub', desc: 'Frame qualité alimentaire' },
  { topic: 'petfood/esp32cam/{id}/quality', qos: 1, dir: 'pub', desc: 'Score IA + humidité/temp' },
  { topic: 'petfood/sensor/{id}/telemetry', qos: 0, dir: 'pub', desc: 'Capteurs génériques (eau, collier)' },
  { topic: 'petfood/platform/pulse', qos: 0, dir: 'pub', desc: 'Pulse plateforme live' },
];

/** Résumé stack embarqué pour dashboards. */
export const buildEmbeddedStackSummary = (pack = {}) => {
  const devices = pack.devices || [];
  const online = devices.filter((d) => d.status === 'online').length;
  const feeders = devices.filter((d) => d.type === 'feeder');
  const cams = devices.filter((d) => d.type === 'feeder-cam');

  return {
    dominanceScore: Math.min(100, 62 + online * 6 + (pack.mqtt?.connected ? 12 : 0) + PCB_BOARDS.length * 4),
    layers: EMBEDDED_STACK_LAYERS.length,
    sensorCount: EMBEDDED_SENSORS.length,
    firmwareBuilds: EMBEDDED_FIRMWARE.length,
    pcbBoards: PCB_BOARDS.length,
    mqttTopics: MQTT_TOPIC_SCHEMA.length,
    devicesOnline: online,
    devicesTotal: devices.length,
    feedersOnline: feeders.filter((d) => d.status === 'online').length,
    camsOnline: cams.filter((d) => d.status === 'online').length,
    mqttConnected: pack.mqtt?.connected ?? false,
    broker: pack.mqtt?.broker || 'mqtt://localhost:1883',
    edgeLatencyMs: pack.networkHealth?.avgLatencyMs ?? 24 + (online * 3),
    stackVersion: 'PetFoodIoT Edge v2.4',
  };
};

export default {
  EMBEDDED_STACK_LAYERS,
  EMBEDDED_SENSORS,
  EMBEDDED_FIRMWARE,
  MQTT_TOPIC_SCHEMA,
  buildEmbeddedStackSummary,
};
