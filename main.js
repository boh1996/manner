var mappings = {
    "Frokost": "restaurant",
    "Morgenmad": "free_breakfast",
    "Aftensmad": "room_service"
};

Handlebars.registerHelper('foodIcons', function(context, options) {
    return mappings[context];
});

$(window).on('hashchange', function(){
    // On every hash change the render function is called with the new hash.
    // This is how the navigation of our app happens.
    render(decodeURI(window.location.hash).replace("#", ""));
});

$(document).on("click", '[data-href]', function ( e ) {
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

    $.get("data/contacts.json", function( data ) {
        window.contacts = data;
        window.crews = [];

        $.get("data/trips.json", function( data ) {
            window.trips = data;
            var source   = $("#tripItemTemplate").html();
            var template = Handlebars.compile(source);

            window.trips.forEach( function ( element, index ) {
                //window.trips[index]["crew"] = window.trips[index]["crew"].split(",");

                element["crew"].forEach( function ( e, i ) {
                    e = e.trim();
                    if ( window.crews[e] == undefined ) {
                        window.crews[e] = {"name": e, "trips": []};
                    }

                    window.crews[e]["trips"].push(element);
                } );

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

            $("#restaurants").html(html);

            $("#restaurants").addClass("visible");

            $(".mdl-layout-title").html("Forplejning");
        break;

        case "locations":

            $(".mdl-layout-title").html("Indkvartering");
        break;

        case "ferries":
            var source   = $("#ferriesTemplate").html();
            var template = Handlebars.compile(source);
            var context = {"ferries": window.ferries};
            var html    = template(context);

            $("#ferries").html(html);

            $("#ferries").addClass("visible");

            $(".mdl-layout-title").html("Færgeoversigt");
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

            $("#nav-ons").trigger("click");

            $("#dayTripSelect").removeClass("hidden");
            $("#trips").addClass("visible");
            $(".mdl-layout-title").html("Sejladser");
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
                $(".mdl-layout-title").html("Sejlads");
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
                $(".mdl-layout-title").html("Færge");
            } else if ( peoplePatt.test(url) ) {
                var id = url.replace("people/", "");
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

                        if ( item["type"] == "trip" ) {
                            item["icon"] = "directions_boat";
                            item["label"] = "Sejlads";
                        } else if ( item["type"] == "restaurant" ) {
                            item["label"] = item["meal"];
                            item["icon"] = mappings[item["meal"]];
                        }

                        var id = item["day"].toLowerCase().replace("ø", 'oe');
                        var html    = template(item);

                        $("#plan-" + id).find(".mdl-list").append(html);
                    }
                }

                $("#nav-ons").trigger("click");

                $("#peoplePlan").addClass("visible");
                $(".mdl-layout-title").html(context.contact.name);
            } else {
                 window.location.hash = "#people";
            }
        break;
    }
}