#ifndef FOOD_QUALITY_CAM_CONFIG_H
#define FOOD_QUALITY_CAM_CONFIG_H

#define WIFI_SSID       "VOTRE_WIFI"
#define WIFI_PASSWORD   "VOTRE_MOT_DE_PASSE"

// Backend PetfoodTN (IP PC sur le réseau local)
#define API_BASE        "http://192.168.1.100:5002"

// Clé appareil (hub IoT / distributeur)
#define DEVICE_KEY      "pf_REMPLACER_PAR_CLE_APP"

// DHT11 température / humidité bac croquettes (optionnel, GPIO 13)
#define DHT_PIN         13
#define USE_DHT         true

// Intervalle capture + analyse (ms)
#define ANALYZE_MS      8000

// Afficheur OLED SSD1306 (I2C) — Qualité / État / Stock
#define USE_OLED        true
#define OLED_SDA        14
#define OLED_SCL        15

// Capteur ultrason ou estimation stock (% remplissage récipient)
#define USE_STOCK_EST   true

// true = pas de caméra requise (test bureau)
#define SIMULATION_MODE true

#endif
