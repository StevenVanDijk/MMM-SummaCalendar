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
                    url: 'https://calendar.google.com/calendar/ical/zteven%40gmail.com/private-9cd20111b6353f2fd6041401c6a9b817/basic.ics', // Steven
                    color: 'gold'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/nipe3hhjpl5m1o9bu2j3124kh4%40group.calendar.google.com/private-216fef6869b0f478890aa0f3f86b8dc7/basic.ics', // Gezamelijk
                    color: 'blue'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/pepijn%40summadigita.com/private-cf6c8857f7f6595f581446b453e7d159/basic.ics',        // Pepijn
                    color: 'red'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/meikevalk%40gmail.com/private-bd2236ff6a8a4168019bf23aa188add0/basic.ics', // Meike 
                    color: 'green'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/kasper%40summadigita.com/private-60722de4a7e718df146d37d3dbcd7b4d/basic.ics', // Kasper
                    color: 'yellow'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/marieke%40summadigita.com/private-4b4ddd5a09fbf8ca2f63b417de96edf0/basic.ics', // Marieke
                    color: 'brown'
                }, {
                    url: 'https://calendar.google.com/calendar/ical/u40mq0gqn694mdt70mc9ufjngo%40group.calendar.google.com/private-5ae8bb2659250c672292e2290f4dc692/basic.ics', // Kinderen
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