/**
 * Routes ESP32-CAM qualité croquettes — à copier dans backend-petfood.
 *
 * Installation :
 *   1. docs/backend-iot-food-quality/foodQualityAnalyze.js → backend/utils/
 *   2. Ce fichier → backend/routes/clientIotFoodQuality.routes.js
 *   3. registerRoutes.js : app.use('/api/client/iot', require('./routes/clientIotFoodQuality.routes'));
 */

const express = require('express');
const { analyzeFoodQuality } = require('../utils/foodQualityAnalyze');

const router = express.Router();

const readingsByDevice = new Map();
const MAX_READINGS = 50;

function normalizeReading(body = {}) {
  if (body.quality && body.qualityScore != null) {
    return {
      ...analyzeFoodQuality(body),
      quality: body.quality,
      qualityScore: body.qualityScore,
      deviceId: body.deviceId || 'esp32-cam',
    };
  }
  return {
    ...analyzeFoodQuality(body),
    deviceId: body.deviceId || 'esp32-cam',
  };
}

function pushReading(deviceKey, reading) {
  const key = deviceKey || reading.deviceId || 'default';
  const list = readingsByDevice.get(key) || [];
  list.unshift(reading);
  readingsByDevice.set(key, list.slice(0, MAX_READINGS));
  return list;
}

router.post('/food-quality/reading', (req, res) => {
  try {
    const deviceKey = req.headers['x-device-key'] || req.body?.deviceKey || 'anonymous';
    const reading = normalizeReading(req.body);
    pushReading(deviceKey, reading);
    res.status(201).json({ ok: true, reading, mode: 'live' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Invalid reading' });
  }
});

router.get('/food-quality', (req, res) => {
  const deviceKey = req.headers['x-device-key'] || req.query.deviceKey || 'anonymous';
  const history = readingsByDevice.get(deviceKey) || [];
  const current = history[0] || null;

  if (!current) {
    return res.status(404).json({ error: 'No readings yet', mode: 'live' });
  }

  res.json({
    mode: 'live',
    current,
    history,
    device: {
      id: current.deviceId || 'esp32-cam',
      name: 'ESP32-CAM — Bac croquettes',
      model: 'ESP32-CAM + DHT11',
      status: 'online',
    },
  });
});

module.exports = router;
