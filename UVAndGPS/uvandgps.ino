
#include <Adafruit_GPS.h>
#include <Wire.h>
#include "Adafruit_VEML6070.h"


#define mySerial Serial1

Adafruit_GPS GPS(&mySerial);
Adafruit_VEML6070 uv = Adafruit_VEML6070();
int button = BTN;

#define GPSECHO  true

boolean usingInterrupt = false;
void useInterrupt(boolean);

void setup()  
{

    Serial.begin(9600);
    pinMode(button, INPUT);
    uv.begin(VEML6070_1_T);  // pass in the integration time constant
    GPS.begin(9600);
    mySerial.begin(9600);
    
    GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
    GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);   
    GPS.sendCommand(PGCMD_ANTENNA);
    
    Particle.subscribe("hook-response/data", myHandler, MY_DEVICES);

#ifdef __arm__
  usingInterrupt = false;  
#else
  useInterrupt(true);
#endif

  delay(1000);
}

#ifdef __AVR__
SIGNAL(TIMER0_COMPA_vect) {
  char c = GPS.read();
#ifdef UDR0
  if (GPSECHO)
    if (c) UDR0 = c;  
#endif
}

void useInterrupt(boolean v) {
  if (v) {
    OCR0A = 0xAF;
    TIMSK0 |= _BV(OCIE0A);
    usingInterrupt = true;
  } else {
    TIMSK0 &= ~_BV(OCIE0A);
    usingInterrupt = false;
  }
}
#endif //#ifdef__AVR__

uint32_t timer = millis();
void loop()
{
  if (! usingInterrupt) {
    char c = GPS.read();
  }
  if (GPS.newNMEAreceived()) {

    if (!GPS.parse(GPS.lastNMEA()))   
      return;
  }

  if (timer > millis())  timer = millis();

  // approximately every 2 seconds or so, print out the current stats
  if (millis() - timer > 1000) { 
    timer = millis(); // reset the timer
    
    if(digitalRead(button) == 0){
        if (true) {
          Serial.print("Location: ");
          Serial.print(GPS.latitude, 4); Serial.print(GPS.lat);
          Serial.print(", "); 
          Serial.print(GPS.longitude, 4); Serial.println(GPS.lon);
          Serial.print("Speed (knots): "); Serial.println(GPS.speed);
          Serial.print("UV light level: "); Serial.println(uv.readUV());
          float lat = GPS.latitude;
          float lon = GPS.longitude;
          float speed = GPS.speed;
          float uvlight = uv.readUV();
          //String data = String::format("{ \"longitude\":" +  String(GPS.longitude, 4) + String(GPS.lon) + ", \"latitude\":" + String(GPS.latitude, 4) + String(GPS.lat) + ", \"speed\":" + String(GPS.speed) + ", \"uvLight\":" + String(uv.readUV()) + "}");
          
          //String data = String::format(cata);
          String data = String::format("{ \"longitude\": \"%f\", \"latitude\":\"%f\", \"speed\": \"%f\", \"uvLight\": \"%f\" }", lon, lat, speed, uvlight);
          Serial.println(data);
          
          Particle.publish("data", data);
          
        }
    }
  }
}

void myHandler(const char *event, const char *data) {
  // Formatting output
  String output = String::format("Response from Post:\n  %s\n", data);
  // Log to serial console
  Serial.println(output);
}


















