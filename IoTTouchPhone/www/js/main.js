/*jslint unparam: true */

/* jshint strict: true, -W097, unused:false  */
/*global window, document, d3, $, io, navigator, setTimeout */

//Set the size of the Notifier Circle
$("#notifier_circle").width(0.8 * window.innerWidth);
$("#notifier_circle").height(0.8 * window.innerWidth);


/*
Function: validateIP()
Parameter: none
Description: Attempt to connect to server/Intel IoT platform
*/
function validateIP() {
    'use strict';
    var socket,
    //Get values from text fields
        ip_addr = $("#ip_address").val(),
        port = $("#port").val(),
        script = document.createElement("script");

    //create script tag for socket.io.js file located on your IoT platform (development board)
    script.setAttribute("src", "http://" + ip_addr + ":" + port + "/socket.io/socket.io.js");
    document.head.appendChild(script);
    
    function daysLeft(expiration){
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var firstDate = new Date(expiration);
        var secondDate = Date.now();
        console.log(Math.round(Math.abs(firstDate - secondDate)/(oneDay)));
        return Math.round(Math.abs(firstDate - secondDate)/(oneDay));
    }
    
//    function formatDate(date){
//        date = new Date(date);
//        return ((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
//    }
    //Wait 1 second before connecting
    setTimeout(function () {
        try {
            //Connect to Server
            socket = io.connect("http://" + ip_addr + ":" + port);

            //Attach a 'connected' event handler to the socket
            socket.on("connected", function (message) {
//                navigator.notification.alert(
//                    'Welcome',  // message
//                    "",                     // callback
//                    'Hi There!',            // title
//                    'Ok'                  // buttonName
//                );
            });

            //Set all Back button to not show
            $.ui.showBackButton = false;
            //Load page with transition
            $.ui.loadContent("#main", false, false, "fade");

            socket.on("foodAdded", function (message) {
                //alert("Is anyone there? "+message);
//                if (message === "present") {
                    console.log(message);
                    $('#name').html(message.name);
                    $('#dateAdded').html(formatDate(message.dateAdded));
                    $('#status').html(message.status);
                    $('#daysToUse').html(daysLeft(message.expiration));
//                    $("#notifier_circle").attr("class", "green");
//                    //Update log
//                    $("#feedback_log").append(Date().substr(0, 21) + " Someone is Present!<br>");
//                    //Prompt user with Cordova notification alert
//                    navigator.notification.alert(
//                        'Someone is Present!',  // message
//                        "",                     // callback
//                        'Check Your Door',            // title
//                        'Ok'                  // buttonName
//                    );
//                    //Wait 2 seconds then turn back to gray
//                    setTimeout(function () {
//                        $("#notifier_circle").attr("class", "gray");
//                    }, 3000);
//                }
            });
        } catch (e) {
            navigator.notification.alert(
                "Server Not Available!",  // message
                "",                     // callback
                'Connection Error!',            // title
                'Ok'                  // buttonName
            );
        }
    }, 1000);
}
