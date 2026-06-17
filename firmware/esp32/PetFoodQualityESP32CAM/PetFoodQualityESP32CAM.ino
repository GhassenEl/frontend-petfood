/**
 * PetfoodTN — ESP32-CAM : qualité croquettes temps réel (bonne / mauvaise)
 *
 * Comme un réfrigérateur connecté : vision (couleur + taches + insectes) + température + humidité.
 * Affichage local SSD1306 OLED : Qualité %, État, Stock %.
 *
 * Bibliothèques Arduino :
 *   - esp32 by Espressif
 *   - DHT sensor library (Adafruit)
 *   - Adafruit SSD1306 + Adafruit GFX (si USE_OLED)
 *   - ArduinoJson
 *
 * Carte : AI Thinker ESP32-CAM
 * Copier config.example.h → config.h
 */

#include "config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <string.h>
#include "esp_camera.h"
#include "esp_timer.h"

#if USE_DHT
#include <DHT.h>
DHT dht(DHT_PIN, DHT11);
#endif

#if USE_OLED
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
#endif

// Broches ESP32-CAM AI Thinker
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

static float simTemp = 21.0f;
static float simHum = 44.0f;
static float simStock = 65.0f;
static int simPhase = 0;

#if USE_OLED
bool initOled() {
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED init échouée");
    return false;
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.display();
  return true;
}

void updateOled(int score, const char* stateLabel, int stockPct, bool critical) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("PETFOODIOT");
  if (score < 50 && !critical) {
    display.println("! ALERTE");
    display.println("Nourriture altere");
    display.printf("Qualite: %d%%", score);
  } else if (critical) {
    display.println("! ALERTE");
    display.println("Remplacer");
    display.println("l'aliment");
    display.printf("Qualite: %d%%", score);
  } else {
    display.setCursor(0, 12);
    display.printf("Qualite: %d%%", score);
    display.setCursor(0, 24);
    display.printf("Stock: %d%%", stockPct);
    display.setCursor(0, 36);
    display.printf("Etat: %s", stateLabel);
  }
  display.display();
}
#endif

/** Estime le niveau restant (% pixels nourriture vs fond). */
float estimateStockLevel(camera_fb_t* fb, float avgR) {
#if USE_STOCK_EST
  if (!fb || !fb->buf) return simStock;
  uint32_t foodPx = 0;
  const size_t pixels = fb->len / 2;
  const uint16_t* buf = (const uint16_t*)fb->buf;
  for (size_t i = 0; i < pixels; i += 8) {
    uint16_t p = buf[i];
    uint8_t r = ((p >> 11) & 0x1F) << 3;
    if (r > 90 && r < 200) foodPx++;
  }
  const size_t sampled = pixels / 8;
  if (sampled == 0) return simStock;
  float ratio = (float)foodPx / sampled;
  return fmaxf(5.0f, fminf(95.0f, ratio * 100.0f));
#else
  return simStock;
#endif
}

bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_ssd1306 = -1;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_RGB565;
  config.frame_size = FRAMESIZE_QQVGA;  // 160x120 — léger pour analyse locale
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;

  esp_err_t err = esp_camera_init(&config);
  return err == ESP_OK;
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("WiFi");
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? " OK" : " ECHEC");
}

/** Analyse couleur + moisissure + insectes (petits clusters sombres) sur frame RGB565. */
void analyzeFrame(camera_fb_t* fb, float* avgR, float* avgG, float* avgB, float* moldRatio, float* insectRatio) {
  *avgR = *avgG = *avgB = 0;
  *moldRatio = 0;
  *insectRatio = 0;
  if (!fb || !fb->buf) return;

  uint32_t sumR = 0, sumG = 0, sumB = 0;
  uint32_t dark = 0;
  uint32_t insect = 0;
  const size_t pixels = fb->len / 2;
  const uint16_t* buf = (const uint16_t*)fb->buf;

  for (size_t i = 0; i < pixels; i += 4) {  // échantillonnage 1/4
    uint16_t p = buf[i];
    uint8_t r = (p >> 11) & 0x1F;
    uint8_t g = (p >> 5) & 0x3F;
    uint8_t b = p & 0x1F;
    r = (r << 3) | (r >> 2);
    g = (g << 2) | (g >> 4);
    b = (b << 3) | (b >> 2);
    sumR += r;
    sumG += g;
    sumB += b;
    if (g > r + 15 && g > b + 10) dark++;
    else if (r < 60 && g < 80 && b < 60) dark++;
    else if (r < 45 && g < 45 && b < 45 && (i % 16 == 0)) insect++;
  }

  const size_t sampled = pixels / 4;
  if (sampled == 0) return;
  *avgR = (float)sumR / sampled;
  *avgG = (float)sumG / sampled;
  *avgB = (float)sumB / sampled;
  *moldRatio = (float)dark / sampled;
  *insectRatio = (float)insect / sampled;
}

void simulateReading(float* avgR, float* avgG, float* avgB, float* moldRatio, float* insectRatio, float* temp, float* hum, float* stock) {
  simPhase = (simPhase + 1) % 4;
  if (simPhase == 0) {
    *avgR = 165; *avgG = 120; *avgB = 75; *moldRatio = 0.01f; *insectRatio = 0.0f;
    simTemp = 20.0f; simHum = 42.0f; simStock = 65.0f;
  } else if (simPhase == 1) {
    *avgR = 130; *avgG = 135; *avgB = 80; *moldRatio = 0.05f; *insectRatio = 0.005f;
    simTemp = 26.0f; simHum = 62.0f; simStock = 38.0f;
  } else if (simPhase == 2) {
    *avgR = 90; *avgG = 150; *avgB = 70; *moldRatio = 0.14f; *insectRatio = 0.018f;
    simTemp = 29.0f; simHum = 75.0f; simStock = 22.0f;
  } else {
    *avgR = 75; *avgG = 160; *avgB = 65; *moldRatio = 0.18f; *insectRatio = 0.032f;
    simTemp = 31.0f; simHum = 78.0f; simStock = 15.0f;
  }
  *temp = simTemp + (random(0, 20) - 10) * 0.1f;
  *hum = simHum + (random(0, 10) - 5);
  *stock = simStock + (random(0, 10) - 5);
}

const char* qualityStateLabel(const char* quality) {
  if (strcmp(quality, "critical") == 0 || strcmp(quality, "bad") == 0) return "Altere";
  if (strcmp(quality, "warning") == 0) return "Limite";
  return "Frais";
}

/** Score qualité (aligné frontend foodQualityEngine.js). */
const char* scoreQuality(int* score, float avgR, float avgG, float avgB, float mold, float insect, float temp, float hum) {
  *score = 92;
  if (temp > 28) *score -= 35;
  else if (temp > 25) *score -= 18;
  else if (temp > 22) *score -= 8;
  if (hum > 70) *score -= 30;
  else if (hum > 60) *score -= 15;
  if (avgG > avgR * 0.3f + 35) *score -= 20;
  if (mold > 0.12f) *score -= 40;
  else if (mold > 0.06f) *score -= 22;
  else if (mold > 0.03f) *score -= 10;
  if (insect > 0.025f) *score -= 35;
  else if (insect > 0.012f) *score -= 18;
  if (*score < 0) *score = 0;
  if (*score > 100) *score = 100;
  if (*score < 40) return "critical";
  if (*score < 50) return "bad";
  if (*score < 75) return "warning";
  return "good";
}

bool postQuality(float avgR, float avgG, float avgB, float mold, float insect, float temp, float hum, float stock, const char* quality, int score) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = String(API_BASE) + "/api/client/iot/food-quality/reading";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);

  StaticJsonDocument<512> doc;
  doc["deviceId"] = "esp32-cam";
  doc["source"] = "esp32-cam";
  doc["avgR"] = avgR;
  doc["avgG"] = avgG;
  doc["avgB"] = avgB;
  doc["moldPixelRatio"] = mold;
  doc["insectPixelRatio"] = insect;
  doc["stockLevelPct"] = stock;
  doc["temperatureC"] = temp;
  doc["humidityPct"] = hum;
  doc["quality"] = quality;
  doc["qualityScore"] = score;
  doc["analyzedAt"] = millis();

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  http.end();

  Serial.printf("POST %s → HTTP %d | qualité=%s score=%d temp=%.1f hum=%.0f mold=%.3f\n",
                url.c_str(), code, quality, score, temp, hum, mold);
  return code >= 200 && code < 300;
}

void setup() {
  Serial.begin(115200);
  randomSeed(esp_timer_get_time());

#if USE_DHT
  dht.begin();
#endif

#if USE_OLED
  initOled();
#endif

  connectWiFi();

#if !SIMULATION_MODE
  if (!initCamera()) {
    Serial.println("Caméra init échouée — bascule SIMULATION_MODE recommandée");
  }
#else
  Serial.println("Mode SIMULATION_MODE — pas de capture réelle");
#endif
}

void loop() {
  float avgR, avgG, avgB, mold, insect = 0, temp = 22.0f, hum = 45.0f, stock = 65.0f;

#if SIMULATION_MODE
  simulateReading(&avgR, &avgG, &avgB, &mold, &insect, &temp, &hum, &stock);
#else
  camera_fb_t* fb = esp_camera_fb_get();
  analyzeFrame(fb, &avgR, &avgG, &avgB, &mold, &insect);
  stock = estimateStockLevel(fb, avgR);
  esp_camera_fb_return(fb);
#if USE_DHT
  temp = dht.readTemperature();
  hum = dht.readHumidity();
  if (isnan(temp)) temp = 22.0f;
  if (isnan(hum)) hum = 45.0f;
#endif
#endif

  int score = 0;
  const char* quality = scoreQuality(&score, avgR, avgG, avgB, mold, insect, temp, hum);
  postQuality(avgR, avgG, avgB, mold, insect, temp, hum, stock, quality, score);

#if USE_OLED
  updateOled(score, qualityStateLabel(quality), (int)stock, score < 40);
#endif

  delay(ANALYZE_MS);
}
