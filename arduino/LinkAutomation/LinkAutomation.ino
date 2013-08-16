#include "Arduino.h"
#include <Ethernet.h>
#include <SPI.h>
#include <WebSocketClient.h>

#define DIGITAL_PINS 14
#define ANALOG_PINS 4

char deviceId[] = "deviceId: 1";

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
char server[] = "xp.skeenan.com";//"echo.websocket.org";//
unsigned int port = 80;
WebSocketClient client;

boolean onMacbook = true;
byte macIp[] = { 192, 168, 2, 3 };
byte googDns[] = { 8, 8, 8, 8 };

// TODO: Change the activeStreamPins to arrays based on their DIGITAL_PINS
// and ANALOG_PINS respectively

// used as a boolean array CAN be changed to _any_
// size data structure, 1 bit at least needed for each digital pin
unsigned int activeDigStreamPins = 0;

// used as a boolean array CAN be changed to _any_
// size data structure, 1 bit at least needed for each analog pin
unsigned int activeAngStreamPins = 0;

int analogThresholdArray[ANALOG_PINS];

void setup() {
  Serial.begin(9600);
  Serial.println("Opened Serial Line");

  openConnection();


  initIR();

}

void loop() {

  client.monitor();

  // Uncomment and fix to enable steaming of pins
  // streamPins();

  if (!client.connected()){
    client.disconnect();
    Serial.println("Attempting to reconnect");
    openConnection();
  }
}

String nullString = String("null");

void dataArrived(WebSocketClient client, String data) {
  Serial.println("Data Arrived: " + data);
  checkRemote(data);
  String pin = extractParameter(data, "pin");
  Serial.println("Pin is: " + pin);
  if (!pin.equals(nullString)) {
    char pinChar[pin.length() + 1];
    pin.toCharArray(pinChar, pin.length()+1);
    int pinNum = atoi(pinChar);
//    Serial.println(pin + "::" + pinNum);
    String type = extractParameter(data, "type");
//    Serial.println("Type is: " + type);

    String analogStr = extractParameter(data, "analog");
    int analog = -1;   //Should NOT be used as a flag for invalid analog
                      //Instead use analogStr.equals(nullString)
    if (!analogStr.equals(nullString)){
      char analogChar[analogStr.length() + 1];
      analogStr.toCharArray(analogChar, analogStr.length()+1);
      analog = atoi(analogChar);
      Serial.println(analogStr + "::" + analog);
    }

    String cmd = extractParameter(data, "cmd");
//    Serial.println("Cmd is: " + cmd);
    if (cmd.equals("initPin")){
      if (type.equals("output")) {
        // Serial.println("Set Pin Output");
        pinMode(pinNum, OUTPUT);
      } else if (type.equals("input")) {
        // Serial.println("Set Pin Input");
        pinMode(pinNum, INPUT);
      }
    } else if (cmd.equals("setPin")){
      if (type.equals("on")) {
        // Serial.println("Set Pin High");
        digitalWrite(pinNum, HIGH);
      } else if (type.equals("off")) {
        // Serial.println("Set Pin Low");
        digitalWrite(pinNum, LOW);
      } else if (!analogStr.equals(nullString)) {
        analogWrite(pinNum, analog);
      }
    } else if (cmd.equals("setThreshold")){
      if (type.equals("on") && !analogStr.equals(nullString)){
        activeAngStreamPins = activeDigStreamPins | (1 << pinNum);
        analogThresholdArray[pinNum] = analog;
        readAndOutputAnalogPin(pinNum, true);
      } else if (type.equals("off")){
        activeAngStreamPins = activeDigStreamPins & (~(1 << pinNum));
      }

    } else if (cmd.equals("setStream")){
      if (type.equals("on")){
        activeDigStreamPins = activeDigStreamPins | (1 << pinNum);
        Serial.println(String("Set Stream On:") + activeDigStreamPins);
        readAndOutputPin(pinNum, true);

      } else if (type.equals("off")) {
        activeDigStreamPins = activeDigStreamPins & (~(1 << pinNum));
        Serial.println(String("Set Stream Off:") + activeDigStreamPins);
      }
    } else if (cmd.equals("readPin")){
      if (type.equals("digital")) {
        readAndOutputPin(pinNum, true);
      } else if (type.equals("analog")) {
        readAndOutputAnalogPin(pinNum, true);
      }
    }
  }
}

int currentState = 0;

void streamPins() {
  for (int i=0; i < DIGITAL_PINS; i++) {
    //Serial.println(String("Streaming Pin") + (activeDigStreamPins &  (1 << i)));
    if ((activeDigStreamPins & (1 << i)) != 0) {
      readAndOutputPin(i, false);
    }
  }
  for (int i=0; i < ANALOG_PINS; i++) {
    if ((activeAngStreamPins & (1 << i)) != 0) {
      readAndOutputAnalogPin(i, false);
    }
  }
}

void readAndOutputPin(int pin, boolean isForced) {
  int readVal = digitalRead(pin);
  if (isForced || currentState & (1 << pin) != (readVal << pin)) {
    currentState &= ~(1 << pin);
    currentState |= (readVal << pin);
    String outString = String("Stream;pin=") + pin + String(";value=") + readVal + String(";");
    //Serial.println("Sending Out: " + outString);
    client.send(outString);
  }
}

unsigned int analogCurrentState = 0;

void readAndOutputAnalogPin(int pin, boolean isForced) {
  int readVal = analogRead(pin);
  int binaryRep = (readVal > analogThresholdArray[pin]) ? 1 : 0;
  if (isForced || (analogCurrentState & (1 << pin) != (binaryRep << pin))) {
    analogCurrentState &= ~(1 << pin);
    analogCurrentState |= (binaryRep << pin);
    String outString = String("AnalogStream;pin=") + pin + String(";value=") + readVal + String(";");
    //Serial.println("Sending Out: " + outString);
    client.send(outString);
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

    Serial.println("Macbook");
    Serial.println(macIp[3]);
    Ethernet.begin(mac, macIp, googDns);
  } else {
    Serial.println("Regular request");
    Ethernet.begin(mac);
  }

  Serial.println("Began Listening on Ethernet");
  delay(1000);
  bool result = client.connect(server, "/", port);
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


// This sketch will send out a Nikon D50 trigger signal (probably works with most Nikons)
// See the full tutorial at http://www.ladyada.net/learn/sensors/ir.html
// this code is public domain, please enjoy!

int IRledPin =  8;    // LED connected to digital pin 8

void initIR()   {
  // initialize the IR digital pin as an output:
  pinMode(IRledPin, OUTPUT);

}

void checkRemote(String data){
  if (data.equals("Projector_On")){
    Serial.println("Projector!");
    SendProjOn();
  } else if (data.equals("Speakers_On")){
    Serial.println("Speaker!");
    turnSpeakersOn();
  } else if (data.equals("Speakers_Off")){
    Serial.println("Speaker!");
    turnSpeakersOff();
  } else if (data.equals("Speakers_Up")){
    Serial.println("Speaker!");
    volumeUp();
  } else if (data.equals("Speakers_Down")){
    Serial.println("Speaker!");
    volumeDown();
  }
}

// This procedure sends a 38KHz pulse to the IRledPin
// for a certain # of microseconds. We'll use this whenever we need to send codes
void pulseIR(long microsecs) {
  // we'll count down from the number of microseconds we are told to wait

  cli();  // this turns off any background interrupts

  while (microsecs > 0) {
    // 38 kHz is about 13 microseconds high and 13 microseconds low
   digitalWrite(IRledPin, HIGH);  // this takes about 3 microseconds to happen
   delayMicroseconds(10);         // hang out for 10 microseconds, you can also change this to 9 if its not working
   digitalWrite(IRledPin, LOW);   // this also takes about 3 microseconds
   delayMicroseconds(10);         // hang out for 10 microseconds, you can also change this to 9 if its not working

   // so 26 microseconds altogether
   microsecs -= 26;
  }

  sei();  // this turns them back on
}

void SendProjOn() {
  pulseIR(8940);
  delayMicroseconds(4320);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(39040);
  pulseIR(8940);
  delayMicroseconds(4340);
  pulseIR(620);
  delayMicroseconds(1600);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(620);
  delayMicroseconds(480);
  pulseIR(620);
  delayMicroseconds(1600);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(620);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(1580);
  pulseIR(640);
  delayMicroseconds(460);
  pulseIR(620);

}

void turnSpeakersOn() {
  pulseIR(1060);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delay(49);
  pulseIR(1040);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(440);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(540);

}

void turnSpeakersOff(){
  pulseIR(1060);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1420);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(440);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1420);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(540);
  delay(49);
  pulseIR(1060);
  delayMicroseconds(1420);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(420);
  pulseIR(560);
  delayMicroseconds(420);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(560);
  delayMicroseconds(1400);
  pulseIR(540);
  delayMicroseconds(1400);
  pulseIR(540);
}

void volumeUp(){
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(560);
  delay(49);
  pulseIR(1080);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1360);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1340);
  pulseIR(600);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  // delay(49);
  // pulseIR(1060);
  // delayMicroseconds(1380);
  // pulseIR(580);
  // delayMicroseconds(1380);
  // pulseIR(580);
  // delayMicroseconds(400);
  // pulseIR(560);
  // delayMicroseconds(400);
  // pulseIR(580);
  // delayMicroseconds(380);
  // pulseIR(580);
  // delayMicroseconds(400);
  // pulseIR(560);
  // delayMicroseconds(1380);
  // pulseIR(580);
  // delayMicroseconds(1380);
  // pulseIR(560);
  // delayMicroseconds(1380);
  // pulseIR(580);
  // delayMicroseconds(400);
  // pulseIR(560);
  // delayMicroseconds(1380);
  // pulseIR(580);
  // delayMicroseconds(1380);
  // pulseIR(560);
  // delayMicroseconds(1380);
  // pulseIR(580);
  // delayMicroseconds(1380);
  // pulseIR(560);
  // delayMicroseconds(400);
  // pulseIR(580);
  // delayMicroseconds(400);
  // pulseIR(560);
  // delayMicroseconds(400);
  // pulseIR(580);
}

void volumeDown(){
  pulseIR(1060);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delay(49);
  pulseIR(1080);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(1360);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(400);
  pulseIR(580);
  delayMicroseconds(380);
  pulseIR(580);
  delayMicroseconds(1360);
  pulseIR(600);
  delayMicroseconds(1380);
  pulseIR(560);
  delayMicroseconds(1380);
  pulseIR(560);
}