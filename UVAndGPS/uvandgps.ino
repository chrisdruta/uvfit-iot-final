
#include <Adafruit_GPS.h>
#include <Wire.h>
#include "Adafruit_VEML6070.h"
#include <stdio.h>
#include <math.h>

#define mySerial Serial1

Adafruit_GPS GPS(&mySerial);
Adafruit_VEML6070 uv = Adafruit_VEML6070();
int button = BTN;


int userUVLevel = 1;


enum State {noActivity, activity, sendingData, emptyLists};
State state = noActivity;
bool executeStateMachines = false;

static const int MAXPOINTS = 601;
int currentPoint = 0;

int led = D7; 
bool flash = false;
float lons[MAXPOINTS];
float lats[MAXPOINTS];
float uvs[MAXPOINTS];
float speeds[MAXPOINTS];


uint32_t dayAmount = 1000 * 60 * 60 * 24;


#define GPSECHO  true

boolean usingInterrupt = false;
void useInterrupt(boolean);

void stateMachineScheduler() {
    executeStateMachines = true;
}

Timer stateMachineTimer(1000, stateMachineScheduler);

void setup()  
{
    pinMode(led, OUTPUT);
    Serial.begin(9600);
    pinMode(button, INPUT);
    uv.begin(VEML6070_1_T);  // pass in the integration time constant
    GPS.begin(9600);
    mySerial.begin(9600);
    
    GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
    GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);   
    GPS.sendCommand(PGCMD_ANTENNA);
    
    Particle.subscribe("hook-response/data", myHandler, MY_DEVICES);
    Particle.subscribe("hook-response/getUV", myHandler2, MY_DEVICES);
    
    stateMachineTimer.start();

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
  
  if (executeStateMachines) {
        execute();
        executeStateMachines = false;
    }

  // approximately every 2 seconds or so, print out the current stats
  if (millis() - timer > 1000) { 
    timer = millis(); // reset the timer
    
  }
}

void execute(){
    //float lat = convertDegMinToDecDeg(GPS.latitude);
    //float lon = convertDegMinToDecDeg(GPS.longitude);
    float speed = GPS.speed;
    float uvlight = uv.readUV();
    
    float lat = GPS.latitudeDegrees;
    float lon = GPS.longitudeDegrees;
    
    switch(state){
        case noActivity:
        {
            currentPoint = 0;
            flash = false;
            digitalWrite(led, LOW);

            if(digitalRead(button) == 0){
                state = activity;
                Particle.publish("getUV", "nothing", PRIVATE);
                digitalWrite(led, HIGH);
            }
           
            
            break;
        }
        case activity:
        {
            if(uvlight > userUVLevel){//replace with uvlight value
                digitalWrite(D7, (flash) ? HIGH : LOW);
                flash = !flash;
            }
            else {
                digitalWrite(led, HIGH);
            }
            lats[currentPoint] = lat;
            lons[currentPoint] = lon;
            speeds[currentPoint] = speed;
            uvs[currentPoint] = uvlight;
            currentPoint++;
            
            if (currentPoint == MAXPOINTS-1) {
                state = sendingData;
            }
            String data = String::format("{ \"longitude\": \"%f\", \"latitude\":\"%f\", \"speed\": \"%f\", \"uvLight\": \"%f\" }", lon, lat, speed, uvlight);
            Serial.println(data);
            
            if(digitalRead(button) == 0){
                state = sendingData;
                Serial.println(currentPoint);
            }
            break;
        }
        case sendingData:
        {
            currentPoint = 0;
            flash = false;
            digitalWrite(led, LOW);
            
            if(millis() - timer > dayAmount) {
                state = emptyLists;
            }
            
            else if(WiFi.ready()){
                state = noActivity;
                
                String start = String::format("{ \"command\": \"start\" }");
                Particle.publish("data", start);
                
                delay(1000);
                
                while((lats[currentPoint]) != 0 && (currentPoint != MAXPOINTS - 1)){
                    
                    lat = lats[currentPoint];
                    lon = lons[currentPoint];
                    speed = speeds[currentPoint];
                    uvlight = uvs[currentPoint];
                    String data = String::format("{ \"longitude\": \"%f\", \"latitude\":\"%f\", \"speed\": \"%f\", \"uvLight\": \"%f\" }"
                                                 , lon, lat, speed, uvlight);
                    Particle.publish("data", data, PRIVATE);
                    Serial.println("sent");
                    delay(1000);
                    //Serial.println(data);
                    lats[currentPoint] = 0;
                    lons[currentPoint] = 0;
                    speeds[currentPoint] = 0;
                    uvs[currentPoint] = 0;
                    currentPoint++;
                    //Serial.println(currentPoint);
                    
                }
                timer = millis();
                delay(1000);
                String end = String::format("{ \"command\": \"end\" }");
                Particle.publish("data", end);
                break;
            }
            break;
        }
        case emptyLists:
        {
            while(lats[currentPoint] != 0){
                    
                lats[currentPoint] = 0;
                lons[currentPoint] = 0;
                speeds[currentPoint] = 0;
                uvs[currentPoint] = 0;
                currentPoint++;
                //delay(200);
            }
            state = noActivity;
            timer = millis();
            break;
        }
    }
}

void myHandler(const char *event, const char *data) {
  // Formatting output
  String output = String::format("Response from Post:\n  %s\n", data);
  // Log to serial console
  Serial.println(output);
}

void myHandler2(const char *event, const char *data) {
    //String number = String::format("%s", data);
    //Serial.println(number);
    
    sscanf(data, "%d", &userUVLevel);
    
    //Serial.println(userUVLevel);
    
}


float convertDegMinToDecDeg (float degMin) {
  double min = 0.0;
  double decDeg = 0.0;
 
  //get the minutes, fmod() requires double
  min = fmod((double)degMin, 100.0);
 
  //rebuild coordinates in decimal degrees
  degMin = (int) ( degMin / 100 );
  decDeg = degMin + ( min / 60 );
 
  return decDeg;
}

















