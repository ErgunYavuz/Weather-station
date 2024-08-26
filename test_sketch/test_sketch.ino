#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid = "";
const char* password = "";


WebServer server(80);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/api/sensor-data", HTTP_GET, handleSensorData);
  //server.on("/sensor-data", HTTP_OPTIONS, handleCORS);

  server.begin();
}

void loop() {
  server.handleClient();
}

void handleSensorData() {

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Secret-key");

  StaticJsonDocument<200> doc;
  doc["temperature"] = 25.5;
  doc["humidity"] = 60;
  doc["pressure"] = 1013.25;
  doc["timestamp"] = millis();

  String response;
  serializeJson(doc, response);

  server.send(200, "application/json", response);
}

