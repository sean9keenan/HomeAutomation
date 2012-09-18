#include "Arduino.h"
#include <Ethernet.h>
#include <SPI.h>
#include "WebSocketClient.h"

char deviceId[] = "deviceId: 1";

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
char server[] = "xp.skeenan.com";//"echo.websocket.org";//
WebSocketClient client;

boolean onMacbook = true;
byte macIp[] = { 192, 168, 2, 8 };
byte googDns[] = { 8, 8, 8, 8 };

void setup() {
  Serial.begin(9600);
  Serial.println("Opened Serial Line");
  
  openConnection();
}

void loop() {
  
  client.monitor();
  
  if (!client.connected()){
    openConnection();
  }
}

String nullString = String("null");

void dataArrived(WebSocketClient client, String data) {
  Serial.println("Data Arrived: " + data);
  String pin = extractParameter(data, "pin");
  Serial.println("Pin is: " + pin);
  if (!pin.equals(nullString)) {
    char pinChar[pin.length() + 1];
    pin.toCharArray(pinChar, pin.length()+1);
    int pinNum = atoi(pinChar);
    Serial.println(pin + "::" + pinNum);
    String value = extractParameter(data, "value");
    Serial.println("Value is: " + value);
    
    String cmd = extractParameter(data, "cmd");
    Serial.println("Cmd is: " + cmd);
    if (cmd.equals("initPin")){
      if (value.equals("output")) {
        Serial.println("Set Pin Output");
        pinMode(pinNum, OUTPUT);
      } else if (value.equals("input")) {
        Serial.println("Set Pin Input");
        pinMode(pinNum, INPUT);
      }
    } else if (cmd.equals("setPin")){
      if (value.equals("on")) {
        Serial.println("Set Pin High");
        digitalWrite(pinNum, HIGH);
      } else if (value.equals("off")) {
        Serial.println("Set Pin Low");
        digitalWrite(pinNum, LOW);
      }
    }
  }
}

String startChar = ":";
String endChar = ";";

String extractParameter(String input, String key) {
  int keyIndex = input.indexOf(key);
  int startIndex = input.indexOf(startChar, keyIndex);
  int endIndex = input.indexOf(endChar, startIndex);
  if (endIndex <= startIndex) {
    endIndex = input.length();
  }
  if (keyIndex < 0 || startIndex < 0) {
    return nullString;
  }
  return input.substring(startIndex + 1, endIndex);
}

void openConnection() {
   if (onMacbook) {
    Ethernet.begin(mac, macIp, googDns);
  } else {
    Ethernet.begin(mac);
  }
  
  Serial.println("Began Listening on Ethernet");
  delay(1000);
  bool result = client.connect(server);//, "/", 80);
  if (result) {
    Serial.println("Connected Client to websserver:");
    Serial.println(result);
    client.setDataArrivedDelegate(dataArrived);
    Serial.println("setDataArrivedDelegate");
    client.send(deviceId);
    Serial.println("Sent msg out");
  } else {
    onMacbook = !onMacbook;
    macIp[3] ++;
    //considered recursion, but don't want stack to overflow... 
    //will call openConnection again from loop
  }
}
