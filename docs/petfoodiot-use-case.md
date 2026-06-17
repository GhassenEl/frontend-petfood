# PetFoodIoT — Cas d'usage complet

> Intégration PetFoodTN 2026 · ESP32-CAM · IA · Mobile Flutter

## Vue d'ensemble

Le système **PetFoodIoT** permet de surveiller en temps réel la **qualité** et la **quantité** de nourriture destinée aux animaux. Une caméra **ESP32-CAM** capture des images du récipient tandis que des capteurs mesurent les conditions de conservation. Les données sont analysées par un module d'intelligence artificielle puis affichées localement (LCD) et sur la plateforme PetFoodTN.

---

## Scénario principal

1. Le client remplit le distributeur de nourriture.
2. L'ESP32-CAM capture une image **toutes les 30 minutes**.
3. Les capteurs mesurent :
   - Température
   - Humidité
   - Quantité restante
4. Les données sont envoyées à la plateforme PetFoodIoT (`POST /api/client/iot/food-quality/reading`).
5. Le modèle IA analyse l'image pour détecter :
   - Moisissures
   - Présence d'insectes
   - Dégradation de la nourriture
6. Un **score de qualité** est calculé (`foodQualityEngine.js`).
7. L'afficheur **LCD** présente les résultats :

```
PETFOODIOT
Qualité : 95%
Stock : 80%
État : Frais
```

8. Les données sont sauvegardées en base de données.
9. Le client consulte les informations via l'**application mobile** Flutter.

---

## Scénario d'alerte

**Conditions :**

| Paramètre | Seuil |
|-----------|-------|
| Température | > 30 °C |
| Humidité | > 70 % |
| Qualité | < 50 % |

**Affichage LCD :**

```
PETFOODIOT
⚠ ALERTE
Qualité : 42%
Nourriture altérée
```

**Actions système :**

- Notification au **client** (application web + mobile)
- Information du **vétérinaire** (si conditions de conservation dégradées)
- Recommandation : **remplacer la nourriture**

Simulation démo : bouton « Scénario détérioré » → score forcé à **42 %**.

---

## Fonctionnalités IA avancées

| Fonctionnalité | Web | Mobile | Firmware |
|----------------|-----|--------|----------|
| Détection aliments détériorés | ✅ | ✅ | ✅ |
| Estimation stock (vision) | ✅ | ✅ | ✅ |
| Prédiction péremption | — | ✅ | — |
| Recommandation nutritionnelle | ✅ | ✅ | — |
| Anomalie consommation | ✅ | — | — |

---

## Bénéfices

- Sécurité alimentaire des animaux
- Réduction du gaspillage
- Surveillance à distance 24h/24
- Assistance vétérinaire proactive

---

## Fichiers clés

| Composant | Chemin |
|-----------|--------|
| Moteur qualité | `src/utils/foodQualityEngine.js` |
| Notifications | `src/services/foodQualityNotificationService.js` |
| UI client web | `src/components/IoTFoodQualityCamPanel.jsx` |
| Afficheur LCD simulé | `src/components/FoodQualityOledDisplay.jsx` |
| Firmware ESP32-CAM | `firmware/esp32/PetFoodQualityESP32CAM/` |
| App mobile | `mobile_app/lib/screens/food_quality_screen.dart` |
| API backend (stub) | `docs/backend-iot-food-quality/` |

---

## Constantes PetFoodIoT

```javascript
CAPTURE_INTERVAL_MINUTES = 30
ALERT_TEMP_THRESHOLD_C = 30
ALERT_HUMIDITY_THRESHOLD_PCT = 70
NON_CONFORME_THRESHOLD = 50
PETFOODIOT_BRAND = 'PETFOODIOT'
```
