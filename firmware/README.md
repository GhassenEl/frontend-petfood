# PetfoodTN — Distributeur intelligent (ESP32)

Système embarqué de distribution nutritionnelle pour animaux, connecté à l'application PetfoodTN.

## Matériel

| Composant | Rôle | Brochage ESP32 |
|-----------|------|----------------|
| ESP32 | Microcontrôleur + Wi-Fi | — |
| HC-SR04 | Niveau réservoir (ultrason) | TRIG=5, ECHO=18 |
| Capteur IR | Détection animal | GPIO 19 |
| HX711 + cellule de charge | Poids distribué | DOUT=33, SCK=4 |
| DHT11 | Température / humidité | GPIO 23 |
| Servo SG90 | Trappe ouverture/fermeture | GPIO 13 |
| Moteur DC + relais 5V | Vis sans fin distributeur | GPIO 14 |
| LED RGB | Vert=OK, Rouge=réservoir vide | 25, 26, 27 |
| Buzzer | Signaux sonores | GPIO 32 |
| LCD 16x2 I2C | Affichage local | SDA=21, SCL=22 |
| Alimentation 5V | Alim carte + actionneurs | — |

## Fonctionnement

1. Le capteur **IR** détecte l'animal devant la gamelle.
2. Le **servo** ouvre la trappe, le **moteur DC** fait tourner le distributeur.
3. La **cellule de charge (HX711)** mesure la quantité servie.
4. Le **HC-SR04** surveille le niveau du réservoir.
5. **LED verte** = distribution OK · **LED rouge** = réservoir vide.
6. L'**ESP32** envoie la télémétrie au backend et reçoit les commandes (manuelles ou planifiées).

## Installation firmware

1. Installer [Arduino IDE](https://www.arduino.cc/) + carte **ESP32** (Espressif).
2. Installer les bibliothèques listées en tête du fichier `.ino`.
3. Copier `config.example.h` → `config.h` et configurer Wi-Fi + `DEVICE_KEY`.
4. Flasher `PetFeederESP32.ino` sur l'ESP32.

## Liaison avec l'application

1. Connectez-vous sur PetfoodTN en tant que client.
2. Menu **Distributeur IoT** → **Ajouter un distributeur**.
3. Copiez la **clé appareil** dans `config.h` (`DEVICE_KEY`).
4. Définissez `API_BASE` avec l'IP de votre PC (ex: `http://192.168.1.100:5002`).
5. Redémarrez l'ESP32 — le statut passe à **En ligne**.

## API appareil (ESP32)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/feeder/device/heartbeat` | Télémétrie capteurs |
| GET | `/api/feeder/device/commands` | Récupérer commandes + planning |
| POST | `/api/feeder/device/ack` | Confirmer distribution |
| POST | `/api/feeder/device/event` | Journal événement |

En-tête requis : `X-Device-Key: <votre_clé>`

## Schéma simplifié

```
[Réservoir] ──► Moteur DC ──► Trappe (Servo)
                    │
              Cellule HX711 ──► Mesure grammes
[Animal] ──► IR ──► Déclenchement
[Réservoir] ──► HC-SR04 ──► Niveau
[ESP32] ──Wi-Fi──► Backend PetfoodTN ──► App mobile/web
```

## Option IA (ESP32-CAM)

Pour la reconnaissance d'animal, remplacez la détection IR par un module **ESP32-CAM** et envoyez les captures à l'API FastAPI existante (`/fastapi/detect-image`).
