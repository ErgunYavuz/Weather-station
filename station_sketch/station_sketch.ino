#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <ctime>
#include <DHT.h>


#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define DHTPIN 4
#define PHOTOPIN 5

//Time sync server
const char* ntpServer = "pool.ntp.org";
// UTC+1 offset 
const long gmtOffset_sec = 3600;
// Daylight saving
const int daylightOffset_sec = 3600;


WebServer server(80);  
DHT dht(DHTPIN, DHT22);


//defined functions
void setupWiFi();
void setTime();
void handleSensorData();
float readTemperature();
float readHumidity();
float readPressure();

void setup() {
  Serial.begin(115200);
  while(!Serial) continue;

  dht.begin();
  setupWiFi();
  setTime();

  server.on("/api/sensor-data", HTTP_GET, handleSensorData);
  Serial.println("server ready");
  server.begin();
}


void loop() {
  server.handleClient();
}


void setupWiFi() {
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void setTime(){
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.print("Waiting for NTP time sync");
  while (time(nullptr) < 1609459200) { // Check against an old date
    Serial.print(".");
    delay(500);
  }
}

void handleSensorData() {
  Serial.println("handling client request...");

  time_t timestamp;
  time(timestamp);

  StaticJsonDocument<200> doc;
  doc["temperature"] = readTemperature();
  doc["humidity"] = readHumidity();
  doc["pressure"] = readPressure();
  doc["timestamp"] = ctime(&timestamp);

  String response;
  serializeJson(doc, response);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", response);
}


inline float readTemperature() {
  return dht.readTemperature();
}

inline float readHumidity() {
  return dht.readHumidity();
}

inline float readPressure() {
  // Replace when sensor arrives
  std::srand(static_cast<unsigned int>(std::time(0)));
  int random_number = (std::rand() % 2) == 0 ? -1 : 1;
  return 1013 + random_number;
}
