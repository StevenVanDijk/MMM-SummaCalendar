/* Magic Mirror
 * Module: SummaCalendar
 */

Module.register("MMM-SummaCalendar",{
		// Default module config.
        defaults: {
                        frameWidth: "754",
                        frameHeight: "1000",
                        width:"100%",
                        height:"100%"
        },

        start: function () {
                var self = this;
                self.getDom();

                $(document).ready(function() {
                        var $fc = jQuery("#summacal");
                        $fc.fullCalendar({
                                header: false,
                                defaultView: 'list',
                                height: 'auto',
                                visibleRange: function(currentDate) {
                                        return {
                                          start: currentDate.clone(),
                                          end: currentDate.clone().add(2, 'days') // exclusive end, so 2
                                        };
                                      },
                                duration: { days: 2 },
                                noEventsMessage: "Niks om te laten zien"
                        });

                        self.readyForData = true;
                        self.sendSocketNotification('SUMMACAL_INIT');
                });
	},

        resume: function() {
           return this.getDom();
        },
        
        getStyles: function() {
                return [
                        this.file('node_modules/fullcalendar/dist/fullcalendar.min.css')
                ];
        },

        getScripts: function() {
                return [
                        this.file('node_modules/jquery/dist/jquery.js'),
                        this.file('node_modules/moment/min/moment-with-locales.js'),
                        this.file('node_modules/fullcalendar/dist/fullcalendar.js'),
                        this.file('node_modules/ical.js/build/ical.js'),
                        this.file('node_modules/fc-remote-ical/dist/fc-remote-ical.umd.js'),
                        this.file('node_modules/fullcalendar/dist/locale/nl.js')
                ]
        },            

        // Override dom generator.
	getDom: function() {
                var { width, height } = this.config;
                var wrapper = document.createElement("div");
                
                wrapper.style.width = `${this.config.frameWidth}px`;
                wrapper.style.height = `${this.config.frameHeight}px`;

                var html = `
                        <div class="mmm-summaCalendar" style="padding-top: ${100 / (width / height)}%;">
                                <div id="summacal"/>
                        </div>
                `;

                wrapper.insertAdjacentHTML("afterbegin", html);

		return wrapper;
	},
        
        socketNotificationReceived: function(noti, payload) {
                console.log("SummaCalendar: " + noti + " received.");
                if (noti === "SUMMACAL_SENDICAL" && this.readyForData != null)
                {
                        var $fc = jQuery("#summacal");
                        
                        this.import($fc, payload);
                }
        },

        import : function ($fc, icals) {
                $fc.fullCalendar("removeEventSources");
                for (i=0; i<icals.length; i++) {
                        $fc.fullCalendar("addEventSource", FCRemoteIcal._parseCalendar(icals[i].data, icals[i].options));
                }
                var currentDate = moment();
                $fc.fullCalendar("gotoDate", currentDate);
                FCRemoteIcal._expandRecurringEvents(currentDate.clone(), currentDate.clone().add(7, 'days'), null, function(expandedEvents) {
                        $fc.fullCalendar("addEventSource", expandedEvents);
                        FCRemoteIcal._recurringEvents = [];
                });
        }
});
