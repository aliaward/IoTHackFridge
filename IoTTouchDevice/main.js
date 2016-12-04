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

var B = 3975;
var mraa = require("mraa");

var Food = function(name){
    this.name = name;
    this.dateAdded;
    this.open = false;
    this.daysOpened = 0;
    this.expiration;
    this.status = 'ON';
}

var milk;

function updateExpiration (food) {
    var today = Date.now();
    var week = 7 * 24 * 60 * 60 * 1000;

    if (food.status === 'ON') {
        if (!food.expiration) {
            food.expiration = today + 4 * week;
        }
    } else if (food.expiration > today + week) {
        food.expiration = today + week;
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
// Load Grove module
var groveSensor = require('jsupm_grove');

// Create the light sensor object using AIO pin 0
var light = new groveSensor.GroveLight(1);

// Read the input and print both the raw value and a rough lux value,
// waiting one second between readings
function readLightSensorValue() {
    console.log(light.name() + " raw value is " + light.raw_value() +
            ", which is roughly " + light.value() + " lux");
    if(light.value() > 0){
        turnLightOn(milk.status);
    }
    else{
        turnLightOff(milk.status);
    }
}
setInterval(readLightSensorValue, 10000);

var blueLED = new groveSensor.GroveLed(5);
var redLED = new groveSensor.GroveLed(7);
var greenLED = new groveSensor.GroveLed(8);

function turnLightOn(status){
    switch(status) {
        case "ON":
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

function turnLightOff(status){
    if(status==='ON'){
        blueLED.off();
    }
    else if(status==='OPEN'){
        greenLED.off();
    }
    else if(status==='WARN'){
        redLED.off();
    }
    else if(status==='BAD'){
        redLED.off();
    }
}

// Print the name
//console.log(led.name());

// Turn the LED on and off 10 times, pausing one second
// between transitions
//var status = 'WARN';
//var waiting = setInterval(function() {
//        if ( i % 2 == 0 ) {
//            blueLED.on();
//        } else {
//            blueLED.off();
//        }
//        i++;
//        if ( i == 20 ) clearInterval(waiting);
//        }, 1000);

var i = 0;
//var statusSwitch = setInterval(function() {
//    if(status === 'ON'){
//        turnLightOff(status);
//        status = 'OPEN';
//    }
//    else if(status === 'OPEN'){
//        turnLightOff(status);
//        status = 'WARN';
//    }
//    else if(status === 'WARN'){
//        turnLightOff(status);
//        status = 'BAD';
//    }
//    else if(status === 'BAD'){
//        turnLightOff(status);
//        status = 'ON';
//    }
//    i++;
//    if (i===50) clearInterval(statusSwitch);
//}, 2000);

//End LED Snippet
//GROVE Kit A0 Connector --> Aio(0)
var myAnalogPin = new mraa.Aio(0);

//GROVE Kit Shield D6 --> GPIO6
//GROVE Kit Shield D2 --> GPIO2
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
            console.log("Buzz ON!!!");
            socket.emit('message', "present");
            digital_pin_D6.write(touch_sensor_value);
        } else if (touch_sensor_value === 0 && last_t_sensor_value === 1) {
            console.log("Buzz OFF!!!");
            //socket.emit('message', "absent");
            digital_pin_D6.write(touch_sensor_value);
        }
        last_t_sensor_value = touch_sensor_value;

        
    }, 500);
    
            //Temperature sensor
        var a = myAnalogPin.read();
        console.log("Analog Pin (A0) Output: " + a);
        //console.log("Checking....");
        
        var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
        //console.log("Resistance: "+resistance);
        var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
        //console.log("Celsius Temperature "+celsius_temperature); 
        var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
        
        var inFridge = function(){
            return fahrenheit_temperature > 60;
        }
        
        var outOfFridge = function(){
            return fahrenheit_temperature > 80;
        }
        if (inFridge() && !milk){
            milk = new Food('milk');
            milk.dateAdded = Date.now();
            updateExpiration(milk);
            console.log(milk);
        } else if (outOfFridge() && milk.status){
            milk.status = '0PEN';
            updateExpiration(milk);
        };
        console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
        socket.emit("foodAdded", milk);
    
}


//Create Socket.io server
var http = require('http');
var app = http.createServer(function (req, res) {
    'use strict';
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('<h1>Hello world from Intel IoT platform!</h1>');
}).listen(1337);
var io = require('socket.io')(app);

console.log("Sample Reading Touch Sensor");

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');

    //Start watching Sensors connected to Galileo board
    startSensorWatch(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
