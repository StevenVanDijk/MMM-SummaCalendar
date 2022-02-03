"use strict";

const fetch = require('node-fetch');
var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function () {
        var self = this;

        console.log("Starting node helper for: " + self.name);

        var refreshData = function () {
            var cals = [
                {
                    url: 'https://calendar.google.com/calendar/ical/zteven%40gmail.com/private-84627a0a1c0097d07dec8bd3cca251d9/basic.ics', // Steven
                    color: 'gold'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/nipe3hhjpl5m1o9bu2j3124kh4%40group.calendar.google.com/private-4d3dbec67e308a113792aff58b13c839/basic.ics', // Gezamelijk
                    color: 'blue'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/pepijn%40summadigita.com/private-636ad79f8bd46a9341537e632fd13ffd/basic.ics',        // Pepijn
                    color: 'red'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/pepijn%40summadigita.com/private-636ad79f8bd46a9341537e632fd13ffd/basic.ics', // Meike 
                    color: 'green'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/kasper%40summadigita.com/private-1ee72dc5e2899f598ea5f3f37bab5f1a/basic.ics', // Kasper
                    color: 'yellow'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/marieke%40summadigita.com/private-25e167c28a1573d109ac129adc89ce61/basic.ics', // Marieke
                    color: 'brown'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/u40mq0gqn694mdt70mc9ufjngo%40group.calendar.google.com/private-31e5e8dd5205e47e2819610e09c9d1ae/basic.ics', // Droontjes
                    color: 'purple'
                }
            ];

            var fetched = [];
            var promises = [];
            for (var i = 0; i < cals.length; i++) {
                console.log(self.name + ": Fetching " + cals[i].url);
                var color = cals[i].color;
                promises.push((function(color) {
                    var currentUrl = cals[i].url;
                    return fetch(cals[i].url)
                        .then(res => res.text())
                        .then(body => {
                                fetched.push({ 
                                    data: body, 
                                    options: {
                                        color: color
                                    }                            
                                });
                                console.log("got response for " + currentUrl);
                            }
                        )
                    })(color));
            }

            fetch.Promise.all(promises).then(function () {
                self.fetchedIcals = fetched;
                if (self.readyToSend != null) {
                    if (self.fetchedIcals.length === 0)
                    {
                        console.log(self.name + ": No new data");
                    } else {
                        console.log(self.name + ": Send new data (" + self.fetchedIcals.length + ")");
                        self.sendIcals();
                    }
                } else {
                    console.log(self.name + ": Not ready to send");
                }
            });
        };

        refreshData();

        setInterval(refreshData, 5 * 60 * 1000);
    },

    sendIcals: function () {
        if (this.fetchedIcals != null) {
            console.log(this.name + ": Sending icals");
            this.sendSocketNotification('SUMMACAL_SENDICAL', this.fetchedIcals);
        }
    },

    socketNotificationReceived: function (notification, payload) {
        console.log(this.name + ": Received " + notification);
        if (notification === "SUMMACAL_INIT") {
            this.readyToSend = true;

            console.log(this.name + ": Init received");
            this.sendIcals();
            return;
        }
    },
});
