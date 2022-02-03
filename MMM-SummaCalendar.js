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
                        <div>
				<div class="mmm-piam" id="piamHolder">
					<img class="mmm-piam-logo" style="height=2em" src="https://yt3.ggpht.com/IUH1OT7oQgs0AvC-1OEWikhL0P4JunuEe2is51qSEJsqJ9_ijQmr0Eyi_vkJSHDLM0NWFvZ_Jg=s88-c-k-c0x00ffffff-no-rj"/>
					<div class="mmm-piam-content" style="display:inline" id="piam"></div>
				</div>
        	                <div class="mmm-summaCalendar" style="padding-top: ${100 / (width / height)}%;">
                	                <div id="summacal"></div>
                        	</div>
			</div>
                `;

                wrapper.insertAdjacentHTML("afterbegin", html);

		return wrapper;
	},
        
        socketNotificationReceived: function(noti, payload) {
                console.log("SummaCalendar: " + noti + " received.");
                if (noti === "SUMMACAL_SENDICAL" && this.readyForData != null)
                {
			var $piam = jQuery("#piam");
                        var $fc = jQuery("#summacal");
                        this.import($fc, payload);
                        jQuery.get("https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCavWqY7ZVI0rQ7bVccxDnsg&key=AIzaSyDwgaazj2I-ldMc0PRCXpXzg1EvN6IuNAw", function(data, status){
				var stats = data.items[0].statistics;
				$piam.text(stats.viewCount + " views, " + stats.subscriberCount + " subscribers, " + stats.videoCount + " videos");
			});
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
