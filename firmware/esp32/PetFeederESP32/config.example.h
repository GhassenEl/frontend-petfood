#ifndef CONFIG_H
#define CONFIG_H

// Wi-Fi domestique
#define WIFI_SSID       "VOTRE_WIFI"
#define WIFI_PASSWORD   "VOTRE_MOT_DE_PASSE"

// URL du backend PetfoodTN (IP du PC sur le réseau local)
#define API_BASE        "http://192.168.1.100:5002"

// Clé générée lors de l'enregistrement du distributeur dans l'app
#define DEVICE_KEY      "pf_REMPLACER_PAR_CLE_APP"

// Calibration balance HX711 (grammes par unité ADC)
#define SCALE_FACTOR    420.0f

// Intervalles (ms)
#define HEARTBEAT_MS    15000
#define POLL_MS         5000

#endif
