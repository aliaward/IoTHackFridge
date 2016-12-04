/*
 * Intel® XDK IoT Touch Notifier Node.js* App
 *
 * This sample IoT app illustrates how to read digital data using the touch sensor
 * in a Grover Starter Kit Plus – IoT Intel® Edition. Also, this application will
 * start a simple web server on the IoT board that can be used to communicate
 * wirelessly with the board, using a WebSocket connection.
 *
 * This sample has only been tested on a Galileo and Edison board. It may run on
 * other IoT Node.js platforms, but may require changes to the I/O initialization
 * and configuration code.
 *
 * https://software.intel.com/en-us/xdk/docs/lp-xdk-iot
 */


// keep these lines (below) for proper jshinting and jslinting
/*jslint node:true, vars:true, bitwise:true */
/*jshint unused:true, undef:true */
// see http://www.jslint.com/help.html and http://jshint.com/docs

var mraa = require("mraa");
//  Load LCD module
var jsUpmI2cLcd  = require ('jsupm_i2clcd');
// Load Grove module
var groveSensor = require('jsupm_grove');
//Create Socket.io server
var http = require('http');

var B = 3975;

// Create the light sensor object using AIO pin 0
var light = new groveSensor.GroveLight(1);
// Create the led lights for food status
var blueLED = new groveSensor.GroveLed(5);
var redLED = new groveSensor.GroveLed(7);
var greenLED = new groveSensor.GroveLed(8);
// Initialize the LCD  
var lcd = new jsUpmI2cLcd.Jhd1313m1(6, 0x3E, 0x62); 


var milk;







var Food = function(name){
    this.name = name;
    this.dateAdded ;
    this.open = false;
    this.daysOpened = 0;
    this.expiration;
    this.status = 'BAD';
    this.daysLeft = 10;
}

function updateExpiration () {
    var today = Date.now();
    var week = 7 * 24 * 60 * 60 * 1000;

    if (milk.status === 'ON') {
        if (!milk.expiration) {
            milk.expiration = today + 4 * week;
        }
    } else if (milk.expiration > today + week) {
        milk.expiration = today + week;
    }
}

function setLCDDisplay(){
    lcd.setCursor(0,0); // go to the 1st row, 2nd column (0-indexed)
    getFoodColor();
    lcd.write("This is " + milk.status + ".");
    lcd.setCursor(1,0);
    lcd.write(milk.daysLeft + " days left."); // print characters to the LCD screen
}

function getFoodColor(){
    switch(milk.status) {
        case "UNOPENED":
            lcd.setColor(0, 0, 255); //blue
            break;
        case "OPEN":
            lcd.setColor(0, 255, 0); //green
            break;
        case "BAD":
            lcd.setColor(255, 0, 0); //red
            break;
        default:
            console.log('no status set')
    }
}
//Begin LED Snippet
/*
 * Author: Sarah Knepper 
 * Copyright (c) 2015 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Read the input and print both the raw value and a rough lux value,
// waiting one second between readings
function readLightSensorValue() {
    console.log(light.name() + " raw value is " + light.raw_value() +
            ", which is roughly " + light.value() + " lux");
    if(light.value() > 0){
        turnLightOn();
        setLCDDisplay();
    }
    else{
        turnLightOff();
        lcd.clear();
        lcd.setColor(0,0,0);
        
        
    }
}

function turnLightOn(){
    switch(milk.status) {
        case "UNOPENED":
            blueLED.on();
            break;
        case "OPEN":
            greenLED.on();
            break;
        case "BAD":
            redLED.on();
            break;
        default:
            console.log('no status set')
    }
}

function turnLightOff(){
    switch(milk.status) {
        case "UNOPENED":
            blueLED.off();
            break;
        case "OPEN":
            greenLED.off();
            break;
        case "BAD":
            redLED.off();
            break;
        default:
            console.log('no status set')
    }
}

//End LED Snippet
//GROVE Kit A0 Connector --> Aio(0)
var myAnalogPin = new mraa.Aio(0);

//GROVE Kit Shield D6 --> GPIO6
//GROVE Kit Shield D2 --> GPIO2
function startTempWatch(socket) {
    'use strict';
    
    
    
    var inFridge = function(){
        return fahrenheit_temperature > 60;
    }
    
    var outOfFridge = function(){
        return fahrenheit_temperature > 80;
    }
    if (inFridge() && !milk){
        milk = new Food('milk');
        milk.dateAdded = Date.now();
        updateExpiration();
        console.log(milk);
        socket.emit("foodAdded", milk);
    } else if (outOfFridge() && milk.status){
        milk.status = '0PEN';
        updateExpiration();
    };
    
    setInterval(readLightSensorValue, 10000);

}
function startSensorWatch(socket) {
    'use strict';
    var touch_sensor_value = 0, last_t_sensor_value;

    //Touch Sensor connected to D2 connector
    var digital_pin_D2 = new mraa.Gpio(2);
    digital_pin_D2.dir(mraa.DIR_IN);

    //Buzzer connected to D6 connector
    var digital_pin_D6 = new mraa.Gpio(6);
    digital_pin_D6.dir(mraa.DIR_OUT);

    digital_pin_D6.write(0);
    
    
    setInterval(function () {
        touch_sensor_value = digital_pin_D2.read();
        if (touch_sensor_value === 1 && last_t_sensor_value === 0) {
//            console.log("Buzz ON!!!");
            socket.emit('message', "present");
            digital_pin_D6.write(touch_sensor_value);
        } else if (touch_sensor_value === 0 && last_t_sensor_value === 1) {
//            console.log("Buzz OFF!!!");
            //socket.emit('message', "absent");
            digital_pin_D6.write(touch_sensor_value);
        }
        last_t_sensor_value = touch_sensor_value;

        
    }, 500);
}

var app = http.createServer(function (req, res) {
    'use strict';
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('<h1>Hello world from Intel IoT platform!</h1>');
}).listen(1337);
var io = require('socket.io')(app);

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');

    //Start watching Sensors connected to Galileo board
    startTempWatch(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    
//    var inFridge = function(){
//        return fahrenheit_temperature > 60;
//    }
//    var outOfFridge = function(){
//        return fahrenheit_temperature > 80;
//    }
//    if (inFridge() && !milk){
//        milk = new Food('milk');
//        milk.dateAdded = Date.now();
//        updateExpiration();
//        console.log(milk);
//        socket.emit("foodAdded", milk);
//    } else if (outOfFridge() && milk.status){
//        milk.status = '0PEN';
//        updateExpiration();
//    };
});


//    setInterval(readLightSensorValue(), 10000);

//Temperature sensor
var a = myAnalogPin.read();
console.log("Analog Pin (A0) Output: " + a);

var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
//console.log("Resistance: "+resistance);
var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
//console.log("Celsius Temperature "+celsius_temperature); 
var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;



//        console.log("Fahrenheit Temperature: " + fahrenheit_temperature);


