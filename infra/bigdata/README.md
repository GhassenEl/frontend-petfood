# Big Data — PetfoodTN

Architecture de données à grande échelle pour commandes, IoT et images ESP32-CAM.

## Stack

| Technologie | Rôle |
|-------------|------|
| **Apache Kafka** | Ingestion temps réel (commandes, IoT, comportements, métadonnées CAM) |
| **Apache Spark** | Analyse streaming & batch (comportements clients, agrégations) |
| **Apache Hadoop (HDFS)** | Stockage massif historique + images ESP32-CAM |

## Topics Kafka

- `petfood.orders` — événements commandes
- `petfood.iot.telemetry` — capteurs MQTT / distributeurs / fontaines
- `petfood.esp32cam.metadata` — métadonnées qualité + référence image HDFS/MinIO
- `petfood.client.behavior` — navigation, panier, clics (temps réel)

## Démarrage local

```bash
docker compose -f docker-compose.yml -f docker-compose.bigdata.yml up -d
```

- Kafka : `localhost:9092`
- MinIO (images CAM) : `localhost:9000` — console `localhost:9002`

## Frontend

Page plateforme : `/big-data`
