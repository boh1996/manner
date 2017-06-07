window.map = null;
function initMap() {
	window.map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 55.279732, lng: 14.7964033},
		zoom: 14,
		scrollwheel: false
	});

	$.get("data/hotels.json", function( data ) {
		window.hotels = data;

		$(window.hotels).each(function (index, element) {
			new google.maps.Marker({
				map: window.map,
				position: {lat: parseFloat(element.lat), lng: parseFloat(element.lng)},
				title: element.name
	  		});
		});

		var myloc = new google.maps.Marker({
		    clickable: false,
		    icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
		                                                    new google.maps.Size(22,22),
		                                                    new google.maps.Point(0,18),
		                                                    new google.maps.Point(11,11)),
		    shadow: null,
		    zIndex: 999,
		    map: window.map
		});

		if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function(pos) {
		    var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
		    myloc.setPosition(me);
		}, function(error) {
		    // ...
		});
	});
}

Handlebars.registerHelper('breaklines', function (text) {
  text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
  return new Handlebars.SafeString(text);
});

Handlebars.registerHelper('removeComma', function (text) {
  return text.replace(/,\s*$/, "");
});

Handlebars.registerHelper('showFirstNames', function (names) {
	if ( names == undefined ) {
		return "";
	}

	var array = [];

	$(names).each( function ( index, item ) {
		array.push(item.name.split(" ")[0]);
	} );

 	return array.join(", ");
});

Handlebars.registerHelper('firstname', function (text) {
	return text.split(" ")[0];
});

var mappings = {
	"Frokost": "restaurant",
	"Morgenmad": "free_breakfast",
	"Aftensmad": "room_service"
};

var tripMappings = {
	"trip": "directions_boat",
	"afternoon_meeting" : "group_work",
	"afternoom_meeting"	: "group_work",
	"watch_at_harbor" : "watch_later",
	"debate": "speaker_group",
	"run": "directions_run",
	"go_home_event": "directions_run",
	"ferry": "directions_boat",
	"workshop": "play_for_work",
	"breakfast": "free_breakfast",
	"meeting": "speaker_group"
}

Handlebars.registerHelper('foodIcons', function(context, options) {
	return mappings[context];
});

Handlebars.registerHelper('tripIcons', function(context, options) {
	return tripMappings[context];
});

$(document).on("click", "#navigation a", function () {
	$(".mdl-layout__drawer-button").trigger("click");
} );

$(window).on('hashchange', function(){
	// On every hash change the render function is called with the new hash.
	// This is how the navigation of our app happens.
	render(decodeURI(window.location.hash).replace("#", ""));
});

$(document).on("click", '[data-href]', function ( e ) {
	console.log($(this).attr("data-href"));
	window.location.hash = $(this).attr("data-href");
	e.preventDefault();
});

$(document).on("ready", function () {
	$.get("data/ferries.json", function( data ) {
		window.ferries = data;
	});

	$.get("data/restaurants.json", function( data ) {
		window.restaurants = data;
	});

	$.get("data/people.json", function( data ) {
		window.people = data;
	});

	$.get("data/politicians.json", function( data ) {
		window.politicians = data;
	});

	$.get("data/contacts.json", function( data ) {
		window.contacts = data;
		window.crews = [];

		$.get("data/trips.json", function( data ) {
			window.trips = data;
			var source   = $("#tripItemTemplate").html();
			var template = Handlebars.compile(source);

			window.trips.forEach( function ( element, index ) {
				//window.trips[index]["crew"] = window.trips[index]["crew"].split(",");
				
				/*if ( element["crew"].length > 0 ) {
					element["crew"].forEach( function ( e, i ) {
						e = e.trim();
						if ( window.crews[e] == undefined ) {
							window.crews[e] = {"name": e, "trips": []};
						}

						window.crews[e]["trips"].push(element);
					} );
				}

				//window.trips[index]["politicians"] = window.trips[index]["politicians"].split(",");

				/*if ( element["guests"] != undefined ) {
					window.trips[index]["guests"] = window.trips[index]["guests"].split(",");
				}*/

				var id = element["day"].toLowerCase().replace("ø", 'oe');
				var html    = template(element);

				$("#trips-" + id).find(".mdl-list").append(html);
			} );

			render(decodeURI(window.location.hash).replace("#", ""));
		});
	});
});

function render(url) {
	var contactPatt = new RegExp("contact\/(.*)");
	var tripPatt = new RegExp("trip\/(.*)");
	var restaurantPatt = new RegExp("restaurant\/(.*)");
	var ferryPatt = new RegExp("ferry\/(.*)");
	var peoplePatt = new RegExp("people\/(.*)");
	var polPatt = new RegExp("politician\/(.*)");

	$(".visible").removeClass("visible");
	$("#dayTripSelect").addClass("hidden");
	$("#dayPlanSelect").addClass("hidden");

	// This function decides what type of page to show 
	// depending on the current url hash value.
	switch ( url ) {
		case "restaurants":
			var source   = $("#restaurantsTemplate").html();
			var template = Handlebars.compile(source);
			var context = {"restaurants": window.restaurants};
			var html    = template(context);

			$("#restaurants-content").html(html);

			$("#restaurants").addClass("visible");

			$(".mdl-layout-title").html("Forplejning");
		break;

		case "locations":
			$("#locations").addClass("visible");
			$(".mdl-layout-title").html("Indkvartering");
			
			if ( typeof google != "undefined" ) {
				google.maps.event.trigger(window.map,'resize');
				window.map.setCenter({lat: 55.279732, lng: 14.7964033});
			}
		break;

		case "ferries":
			var source   = $("#ferriesTemplate").html();
			var template = Handlebars.compile(source);
			var context = {"ferries": window.ferries};
			var html    = template(context);

			$("#ferries").html(html);

			$("#ferries").addClass("visible");

			$(".mdl-layout-title").html("Transport");
		break;

		case "contacts":
			var source   = $("#contactsTemplate").html();
			var template = Handlebars.compile(source);
			var context = {"contacts": window.contacts};
			var html    = template(context);

			$("#contacts").html(html);

			$("#contacts").addClass("visible");
			$(".mdl-layout-title").html("Kontakter");
		break;

		case 'people':
			var source   = $("#peopleTemplate").html();
			var template = Handlebars.compile(source);
			var context = {"people": window.people};
			var html    = template(context);

			$("#people").html(html);

			$("#people").addClass("visible");
			$(".mdl-layout-title").html("Personer");
		break;

		case "politicians":
			var source   = $("#politiciansTemplate").html();
			var template = Handlebars.compile(source);
			var context = {"politicians": window.politicians};
			var html    = template(context);

			$("#politicians").html(html);

			$("#politicians").addClass("visible");
			$(".mdl-layout-title").html("Politikere");

		break;

		case "plan":
			$("#plan").addClass("visible");
			$(".mdl-layout-title").html("Personer");
		break;

		case "contact":
			$("#contact").addClass("visible");
		break;

		case "trips":
			$("#dayTripSelect a").each( function ( i, nav ) {
				$(nav).attr("href", $(nav).attr("href").replace("plan", "trips"));
			} );

			$("#nav-tor").trigger("click");

			$("#dayTripSelect").removeClass("hidden");
			$("#trips").addClass("visible");
			$(".mdl-layout-title").html("Mandskabsplan");
		break;

		default:
			if ( contactPatt.test(url) ) {
				var id = url.replace("contact/", "");
				var source   = $("#contactTemplate").html();
				var template = Handlebars.compile(source);
				var context = window.contacts[id];
				var html    = template(context);

				$("#contact").find("table").html(html);
				$("#contact").addClass("visible");
				$(".mdl-layout-title").html(context["name"]);
			} else if ( tripPatt.test(url) ) {
				var id = url.replace("trip/", "");
				var source   = $("#tripTemplate").html();
				var template = Handlebars.compile(source);
				var context = window.trips[id];
				var html    = template(context);

				$("#trip").find("table").html(html);
				$("#trip").addClass("visible");
				$(".mdl-layout-title").html("Aktivitet");
			} else if ( restaurantPatt.test(url) ) {
				var id = url.replace("restaurant/", "");
				var source   = $("#restaurantTemplate").html();
				var template = Handlebars.compile(source);
				var context = window.restaurants[id];
				var html    = template(context);

				$("#restaurant").find("table").html(html);
				$("#restaurant").addClass("visible");
				$(".mdl-layout-title").html("Restaurant");
			} else if ( ferryPatt.test(url) ) {
				var id = url.replace("ferry/", "");
				var source   = $("#ferryTemplate").html();
				var template = Handlebars.compile(source);
				var context = window.ferries[id];
				var html    = template(context);

				$("#ferry").find("table").html(html);
				$("#ferry").addClass("visible");
				$(".mdl-layout-title").html("Transport");
			} else if ( polPatt.test(url) ) {
				var id = url.replace("politician/", "");
				var source   = $("#politicianTemplate").html();
				var template = Handlebars.compile(source);
				var context = window.politicians[id];
				/*context.commitee = context.commitee.replace("\n", "<br />");
				context.appointments = context.appointments.replace("\n", "<br />");
				context.private = context.private.replace("\n", "<br />");*/
				var html    = template(context);

				$("#politician").find("table").html(html);
				$("#politician").addClass("visible");
				$(".mdl-layout-title").html(context.name);
			} else if ( peoplePatt.test(url) ) {
				var id = url.replace("people/", "");
				console.log(id);
				var source   = $("#peoplePlanTemplate").html();
				var template = Handlebars.compile(source);
				var context = window.people[id];

				$("#dayTripSelect a").each( function ( i, nav ) {
					$(nav).attr("href", $(nav).attr("href").replace("trips", "plan"));
				} );
				$("#dayTripSelect").removeClass("hidden");

				$("#peoplePlan").find(".mdl-list").each( function ( i, list ) {
					$(list).html("");
				} );

				if ( context != undefined ) {
					for ( var key in context.activities ) {
						item = context.activities[key];

						switch ( item["type"] ) {
							case "trip":
								item["icon"] = "directions_boat";
								if ( item["title"] != "" ) {
									item["label"] = item["title"];
								} else {
									item["label"] = "Sejlads";
								}
							break;

							case "restaurant":
								if ( item["title"] != "" ) {
									item["label"] = item["title"];
								} else {
									item["label"] = item["meal"];
								}
								item["icon"] = mappings[item["meal"]];
							break;

							default:
								if ( item["title"] != "" ) {
									item["label"] = item["title"];
								} else {
									item["label"] = item["type_text"];
								}
								item["icon"] = tripMappings[item["type"]];
							break;
						}

						var id = item["day"].toLowerCase().replace("ø", 'oe');
						var html    = template(item);

						$("#plan-" + id).find(".mdl-list").append(html);
					}
				}

				$("#nav-tor").trigger("click");

				$("#peoplePlan").addClass("visible");
				$(".mdl-layout-title").html(context.contact.name);
			} else {
				 window.location.hash = "#people";
			}
		break;
	}
}