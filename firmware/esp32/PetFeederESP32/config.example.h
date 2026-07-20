#ifndef CONFIG_H
#define CONFIG_H

// Wi-Fi domestique
#define WIFI_SSID       "VOTRE_WIFI"
#define WIFI_PASSWORD   "VOTRE_MOT_DE_PASSE"

// URL du backend PetfoodTN (fallback HTTP si MQTT indisponible)
#define API_BASE        "http://192.168.1.100:5002"

// Clé générée lors de l'enregistrement de la gamelle dans l'app
#define DEVICE_KEY      "pf_REMPLACER_PAR_CLE_APP"

// Identifiant gamelle (UUID Prisma) — sinon DEVICE_KEY est utilisé dans les topics
#define DEVICE_ID       ""

// MQTT (Mosquitto) — transport principal
#define USE_MQTT        1
#define MQTT_BROKER     "192.168.1.100"
#define MQTT_PORT       1883
#define MQTT_USER       ""
#define MQTT_PASSWORD   ""
#define MQTT_TOPIC_PREFIX "petfood/"

// Calibration balance HX711 (grammes par unité ADC) + tare au boot
#define SCALE_FACTOR    420.0f

// Intervalles (ms)
#define HEARTBEAT_MS    15000
#define POLL_MS         5000

// Horaires locaux de secours (HH:MM) si broker offline — portion 30 g
#define LOCAL_SCHEDULE_1 "08:00"
#define LOCAL_SCHEDULE_2 "19:00"
#define LOCAL_PORTION_G  30.0f

#endif
