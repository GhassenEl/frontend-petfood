/** Écosystème IoT PetfoodTN — protocoles, appareils et commandes. */

export const IOT_PROTOCOLS = [
  { id: 'mqtt', label: 'MQTT', icon: '📡', desc: 'Broker temps réel — télémétrie capteurs & distributeurs' },
  { id: 'websocket', label: 'WebSocket', icon: '⚡', desc: 'Événements live vers le dashboard client' },
  { id: 'http', label: 'REST API', icon: '🔗', desc: 'Configuration, historique et commandes' },
  { id: 'ble', label: 'BLE', icon: '📶', desc: 'Provisioning initial des ESP32 (Wi-Fi setup)' },
];

export const IOT_DEVICE_TYPES = [
  { type: 'feeder', icon: '🍽️', label: 'Distributeur ESP32', firmware: 'PetFeederESP32 v2.4' },
  { type: 'feeder-cam', icon: '📷', label: 'ESP32-CAM + OLED', firmware: 'PetCamQuality v1.8' },
  { type: 'water', icon: '💧', label: 'Fontaine connectée', firmware: 'SmartWater v1.2' },
  { type: 'scale', icon: '⚖️', label: 'Balance connectée', firmware: 'PetScale v1.0' },
  { type: 'smart-fridge', icon: '🧊', label: 'Réfrigérateur IoT', firmware: 'ColdChain v1.1' },
  { type: 'wearable-collar', icon: '📿', label: 'Collier PetCollar Vital', firmware: 'PetCollar Vital v2.1' },
];

export const IOT_SETUP_STEPS = [
  { step: 1, title: 'Créer l\'appareil', desc: 'Générez une clé device dans PetfoodTN (distributeur ou caméra).' },
  { step: 2, title: 'Flasher le firmware', desc: 'Utilisez Arduino IDE ou PlatformIO — dossier firmware/esp32/.' },
  { step: 3, title: 'Configurer le Wi-Fi', desc: 'Mode AP « PetfoodSetup » — SSID + mot de passe + device key.' },
  { step: 4, title: 'Vérifier MQTT', desc: 'Topic petfood/{deviceId}/telemetry — statut En ligne sous 30 s.' },
  { step: 5, title: 'Calibrer capteurs', desc: 'Pesée initiale, scan qualité croquettes, seuils température/humidité.' },
];

export const IOT_QUICK_COMMANDS = [
  { id: 'dispense-now', icon: '🍽️', label: 'Distribuer maintenant', desc: 'Portion manuelle 30 g', roles: ['feeder'] },
  { id: 'scan-quality', icon: '📷', label: 'Scan qualité', desc: 'Déclencher ESP32-CAM + OLED', roles: ['feeder-cam'] },
  { id: 'sync-all', icon: '🔄', label: 'Synchroniser tout', desc: 'Rafraîchir télémétrie & mobile', roles: ['all'] },
  { id: 'firmware-check', icon: '⬆️', label: 'Vérifier firmware', desc: 'Contrôle versions OTA', roles: ['all'] },
  { id: 'mqtt-ping', icon: '📡', label: 'Ping MQTT', desc: 'Test latence broker', roles: ['all'] },
  { id: 'water-purge', icon: '💧', label: 'Purge fontaine', desc: 'Cycle nettoyage 60 s', roles: ['water'] },
  { id: 'wearable-sync', icon: '📿', label: 'Sync colliers', desc: 'Rafraîchir vitaux SpO₂ & FC', roles: ['wearable-collar'] },
];

export const IOT_NETWORK_LAYERS = [
  { id: 'edge', label: 'Edge — ESP32', icon: '🔌', items: ['Distributeur', 'ESP32-CAM', 'Fontaine', 'Colliers', 'Capteurs'] },
  { id: 'transport', label: 'Transport', icon: '📡', items: ['Wi-Fi 2.4 GHz', 'MQTT 1883', 'TLS optionnel'] },
  { id: 'platform', label: 'Plateforme', icon: '☁️', items: ['API PetfoodTN', 'WebSocket live', 'IA qualité'] },
  { id: 'client', label: 'Client', icon: '📱', items: ['Dashboard web', 'App mobile', 'Push alertes'] },
];

export default {
  IOT_PROTOCOLS,
  IOT_DEVICE_TYPES,
  IOT_SETUP_STEPS,
  IOT_QUICK_COMMANDS,
  IOT_NETWORK_LAYERS,
};
