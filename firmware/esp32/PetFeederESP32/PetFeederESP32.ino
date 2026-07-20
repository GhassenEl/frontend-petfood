/**
 * PetfoodTN — Gamelle intelligente ESP32 (MQTT principal + fallback HTTP)
 *
 * Bibliothèques Arduino :
 *   - PubSubClient (Nick O'Leary)
 *   - HX711 by Bogdan Necula
 *   - DHT sensor library by Adafruit
 *   - LiquidCrystal I2C by Frank de Brabander
 *   - ArduinoJson by Benoit Blanchon
 *   - WiFi / HTTPClient (intégrés ESP32)
 *
 * Copiez config.example.h → config.h
 * Matériel : ESP32 + HX711 + moteur/servo + HC-SR04 (+ IR, DHT, LED RGB)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include "HX711.h"
#include "config.h"

#ifndef USE_MQTT
#define USE_MQTT 1
#endif
#ifndef MQTT_TOPIC_PREFIX
#define MQTT_TOPIC_PREFIX "petfood/"
#endif
#ifndef DEVICE_ID
#define DEVICE_ID ""
#endif
#ifndef LOCAL_SCHEDULE_1
#define LOCAL_SCHEDULE_1 "08:00"
#endif
#ifndef LOCAL_SCHEDULE_2
#define LOCAL_SCHEDULE_2 "19:00"
#endif
#ifndef LOCAL_PORTION_G
#define LOCAL_PORTION_G 30.0f
#endif
#ifndef FIRMWARE_VERSION
#define FIRMWARE_VERSION "mqtt-1.0.0"
#endif

#define TRIG_PIN        5
#define ECHO_PIN        18
#define IR_PIN          19
#define DHT_PIN         23
#define SERVO_PIN       13
#define MOTOR_PIN       14
#define LED_R_PIN       25
#define LED_G_PIN       26
#define LED_B_PIN       27
#define BUZZER_PIN      32
#define HX711_DOUT      33
#define HX711_SCK       4

#define SERVO_CLOSED    10
#define SERVO_OPEN      90
#define RESERVOIR_EMPTY_CM  28
#define MIN_FOOD_GRAMS      10
#define DISPENSE_TIMEOUT_MS 8000

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT11);
HX711 scale;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

unsigned long lastHeartbeat = 0;
unsigned long lastPoll = 0;
String lastCommandId = "";
bool lowFood = false;
String lastLocalSlot = "";

String deviceTopicId() {
  if (strlen(DEVICE_ID) > 0) return String(DEVICE_ID);
  return String(DEVICE_KEY);
}

String topicBase() {
  return String(MQTT_TOPIC_PREFIX) + "feeder/" + deviceTopicId() + "/";
}

void servoWrite(int angle) {
  int duty = map(angle, 0, 180, 26, 128);
  ledcWrite(0, duty);
}

void setupServo() {
  ledcSetup(0, 50, 10);
  ledcAttachPin(SERVO_PIN, 0);
  servoWrite(SERVO_CLOSED);
}

float readUltrasonicCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration <= 0) return 99.0;
  return duration * 0.034 / 2.0;
}

bool animalDetected() {
  return digitalRead(IR_PIN) == LOW;
}

float readFoodGrams() {
  if (!scale.is_ready()) return -1;
  float raw = scale.get_units(3);
  if (raw < 0) raw = 0;
  return raw;
}

void setRgb(bool red, bool green, bool blue) {
  digitalWrite(LED_R_PIN, red ? HIGH : LOW);
  digitalWrite(LED_G_PIN, green ? HIGH : LOW);
  digitalWrite(LED_B_PIN, blue ? HIGH : LOW);
}

void beepOk() {
  tone(BUZZER_PIN, 1200, 150);
  delay(160);
  tone(BUZZER_PIN, 1600, 120);
}

void beepAlert() {
  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, 600, 200);
    delay(250);
  }
}

void lcdShow(const String& l1, const String& l2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(l1.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print(l2.substring(0, 16));
}

bool postJson(const String& url, const String& json, String& response) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);
  int code = http.POST(json);
  response = http.getString();
  http.end();
  return code >= 200 && code < 300;
}

bool getJson(const String& url, String& response) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("X-Device-Key", DEVICE_KEY);
  int code = http.GET();
  response = http.getString();
  http.end();
  return code >= 200 && code < 300;
}

bool dispenseGrams(float targetGrams) {
  if (lowFood) {
    setRgb(true, false, false);
    beepAlert();
    lcdShow("RESERVOIR VIDE", "LED ROUGE");
    return false;
  }

  if (!animalDetected()) {
    lcdShow("En attente...", "Animal ?");
    unsigned long waitStart = millis();
    while (!animalDetected() && millis() - waitStart < 15000) {
      delay(200);
    }
    if (!animalDetected()) {
      lcdShow("Pas d'animal", "Annule");
      return false;
    }
  }

  float startWeight = readFoodGrams();
  if (startWeight < 0) startWeight = 0;

  servoWrite(SERVO_OPEN);
  digitalWrite(MOTOR_PIN, HIGH);
  lcdShow("Distribution...", String(targetGrams) + " g");

  unsigned long start = millis();
  while (millis() - start < DISPENSE_TIMEOUT_MS) {
    float current = readFoodGrams();
    float dispensed = startWeight - current;
    if (dispensed >= targetGrams - 2) break;
    delay(50);
  }

  digitalWrite(MOTOR_PIN, LOW);
  servoWrite(SERVO_CLOSED);

  float finalDispensed = startWeight - readFoodGrams();
  if (finalDispensed < 0) finalDispensed = 0;

  setRgb(false, true, false);
  beepOk();
  lcdShow("OK", String(finalDispensed, 1) + " g servis");
  return finalDispensed >= targetGrams * 0.7;
}

void updateLowFoodState(float reservoirCm, float foodGrams) {
  lowFood = (reservoirCm >= RESERVOIR_EMPTY_CM) || (foodGrams >= 0 && foodGrams < MIN_FOOD_GRAMS);
  if (lowFood) {
    setRgb(true, false, false);
    lcdShow("ALERTE", "Reservoir vide");
  } else {
    setRgb(false, true, false);
  }
}

void publishMqttJson(const String& suffix, const String& json) {
  if (!mqttClient.connected()) return;
  String topic = topicBase() + suffix;
  mqttClient.publish(topic.c_str(), json.c_str(), false);
}

void publishTelemetry(float reservoirCm, float foodGrams, float temp, float hum, bool animal) {
  StaticJsonDocument<512> doc;
  doc["deviceKey"] = DEVICE_KEY;
  doc["deviceId"] = deviceTopicId();
  doc["firmwareVersion"] = FIRMWARE_VERSION;
  doc["reservoirCm"] = reservoirCm;
  doc["foodGrams"] = foodGrams;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["animalPresent"] = animal;
  doc["isLowFood"] = lowFood;
  doc["macAddress"] = WiFi.macAddress();

  String body;
  serializeJson(doc, body);

#if USE_MQTT
  if (mqttClient.connected()) {
    publishMqttJson("telemetry", body);
    return;
  }
#endif
  String resp;
  postJson(String(API_BASE) + "/api/feeder/device/heartbeat", body, resp);
}

void ackCommand(const String& cmdId, bool success, float grams, const String& msg) {
  StaticJsonDocument<384> doc;
  doc["deviceKey"] = DEVICE_KEY;
  doc["commandId"] = cmdId;
  doc["success"] = success;
  doc["portionGrams"] = grams;
  doc["animalDetected"] = animalDetected();
  doc["foodGrams"] = readFoodGrams();
  doc["reservoirCm"] = readUltrasonicCm();
  doc["message"] = msg;

  String body;
  serializeJson(doc, body);

#if USE_MQTT
  if (mqttClient.connected()) {
    publishMqttJson("ack", body);
    return;
  }
#endif
  String resp;
  postJson(String(API_BASE) + "/api/feeder/device/ack", body, resp);
}

void handleCommandJson(JsonObject cmd) {
  if (cmd.isNull()) return;
  String cmdId = cmd["id"] | cmd["commandId"] | "";
  String action = cmd["action"] | "";
  float grams = cmd["grams"] | cmd["portionGrams"] | 30.0f;
  if (action == "dispense" && cmdId.length() > 0 && cmdId != lastCommandId) {
    lastCommandId = cmdId;
    bool ok = dispenseGrams(grams);
    ackCommand(cmdId, ok, grams, ok ? "Distribution OK" : "Echec distribution");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<1024> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) return;
  if (doc.containsKey("command") && doc["command"].is<JsonObject>()) {
    handleCommandJson(doc["command"].as<JsonObject>());
  } else {
    handleCommandJson(doc.as<JsonObject>());
  }
}

bool reconnectMqtt() {
#if !USE_MQTT
  return false;
#else
  if (WiFi.status() != WL_CONNECTED) return false;
  if (mqttClient.connected()) return true;

  String clientId = "petfeeder-" + String((uint32_t)ESP.getEfuseMac(), HEX);
  bool ok;
  if (strlen(MQTT_USER) > 0) {
    ok = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
  } else {
    ok = mqttClient.connect(clientId.c_str());
  }
  if (ok) {
    String cmdTopic = topicBase() + "commands";
    mqttClient.subscribe(cmdTopic.c_str(), 1);
    lcdShow("MQTT OK", cmdTopic.substring(0, 16));
  }
  return ok;
#endif
}

void pollHttpCommands() {
  String resp;
  if (!getJson(String(API_BASE) + "/api/feeder/device/commands", resp)) return;
  StaticJsonDocument<1024> doc;
  if (deserializeJson(doc, resp)) return;
  handleCommandJson(doc["command"].as<JsonObject>());
}

String currentHhMm() {
  // Horloge locale approximative basée sur millis depuis boot (pas de NTP requis pour démo).
  // Pour prod, activer configTime() NTP.
  unsigned long totalMin = (millis() / 60000UL) % (24UL * 60UL);
  int hh = (totalMin / 60) % 24;
  int mm = totalMin % 60;
  char buf[6];
  snprintf(buf, sizeof(buf), "%02d:%02d", hh, mm);
  return String(buf);
}

void maybeLocalSchedule() {
  if (mqttClient.connected()) return; // broker OK → schedules cloud
  String now = currentHhMm();
  if (now == lastLocalSlot) return;
  if (now == String(LOCAL_SCHEDULE_1) || now == String(LOCAL_SCHEDULE_2)) {
    lastLocalSlot = now;
    dispenseGrams(LOCAL_PORTION_G);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(IR_PIN, INPUT_PULLUP);
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(LED_R_PIN, OUTPUT);
  pinMode(LED_G_PIN, OUTPUT);
  pinMode(LED_B_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);

  setupServo();
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcdShow("PetfoodTN", "Gamelle MQTT...");

  dht.begin();
  scale.begin(HX711_DOUT, HX711_SCK);
  scale.set_scale(SCALE_FACTOR);
  scale.tare();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lcdShow("WiFi...", WIFI_SSID);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    lcdShow("WiFi OK", WiFi.localIP().toString());
    setRgb(false, true, false);
    beepOk();
#if USE_MQTT
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setBufferSize(1024);
    reconnectMqtt();
#endif
  } else {
    lcdShow("WiFi ERREUR", "Mode local");
    setRgb(true, false, false);
  }

  delay(1500);
}

void loop() {
  float reservoirCm = readUltrasonicCm();
  float foodGrams = readFoodGrams();
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  bool animal = animalDetected();

  updateLowFoodState(reservoirCm, foodGrams);

#if USE_MQTT
  if (!mqttClient.connected()) {
    reconnectMqtt();
  }
  mqttClient.loop();
#endif

  if (millis() - lastHeartbeat > HEARTBEAT_MS) {
    lastHeartbeat = millis();
    if (WiFi.status() == WL_CONNECTED) {
      publishTelemetry(reservoirCm, foodGrams, temp, hum, animal);
    }
    lcdShow("T:" + String(temp, 0) + "C H:" + String(hum, 0),
            "Niv:" + String(reservoirCm, 0) + "cm");
  }

  if (millis() - lastPoll > POLL_MS) {
    lastPoll = millis();
#if USE_MQTT
    if (!mqttClient.connected() && WiFi.status() == WL_CONNECTED) {
      pollHttpCommands();
    }
#else
    if (WiFi.status() == WL_CONNECTED) {
      pollHttpCommands();
    }
#endif
  }

  maybeLocalSchedule();

  if (animal && !lowFood && digitalRead(0) == LOW) {
    dispenseGrams(30);
    delay(1000);
  }

  delay(50);
}
