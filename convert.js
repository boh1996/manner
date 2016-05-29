var csv = require("fast-csv");
var fs = require('fs');
var https = require('https');

var index = 0;
var first = true;

var tripsUrl = "https://docs.google.com/spreadsheets/d/1MHx-MQmJlK622KasUkiUftnnWMV_qJF2wdJLuNhEsRQ/export?format=csv&id=1MHx-MQmJlK622KasUkiUftnnWMV_qJF2wdJLuNhEsRQ&gid=0";
var contactsUrl = "https://docs.google.com/spreadsheets/d/1Yp6mcxMrwb8icsdhSq0JKydmarGQxSULJ2x4O4kEKKI/export?format=csv&id=1Yp6mcxMrwb8icsdhSq0JKydmarGQxSULJ2x4O4kEKKI&gid=0";
var restaurantsUrl = "https://docs.google.com/spreadsheets/u/0/d/12QBIvAjcXxGoa6a3ehgUgJ-xaQjHTwo87lzYYCU8q6Y/export?format=csv&id=12QBIvAjcXxGoa6a3ehgUgJ-xaQjHTwo87lzYYCU8q6Y&gid=0";
var hotelsUrl = "https://docs.google.com/spreadsheets/u/0/d/1Pu3QzMz0sNM9SeLPrCKBLnGK5zT3f6anmmRdc_8nEIc/export?format=csv&id=1Pu3QzMz0sNM9SeLPrCKBLnGK5zT3f6anmmRdc_8nEIc&gid=0";
var ferriesUrl = "https://docs.google.com/spreadsheets/d/1C-YBTOwm-kjKByvuYTTjS73t5MmUhUkhKjCOKwtGDeM/export?format=csv&id=1C-YBTOwm-kjKByvuYTTjS73t5MmUhUkhKjCOKwtGDeM&gid=0";
var politiciansUrl = "https://docs.google.com/spreadsheets/d/1PgDvGj2LVM1F3S5VV8bXxTykNuUv_YKBFgz1yP9jEwA/export?format=csv&id=1PgDvGj2LVM1F3S5VV8bXxTykNuUv_YKBFgz1yP9jEwA&gid=0";

var contacts = [];
var contacts_lookup = [];
var trips = [];
var restaurants = [];
var hotels = [];
var ferriesList = [];
var people = [];
var politicians = [];
var pol_lookup = [];
var all = [];

var trip_mappings = {
	"Sejlads": "trip",
	"Aftenmøde": "afternoon_meeting",
	"Vagt på kajen": "watch_at_harbor",
	"Debat": "debate",
	"Løb": "run",
	"Gå-hjem event": "go_home_event",
	"Workshop": "workshop"
};

callPoliticians();

function callPoliticians () {
	var politicansFile = fs.createWriteStream("data/politicians.csv");
	https.get(politiciansUrl, function(response) {
	  	var stream = response.pipe(politicansFile);

	  	stream.on('finish', function () {
		  	var polIndex = 0;
			var polFirst = true;

			csv
			.fromPath("data/politicians.csv")
			.on("data", function(data){
			 	if ( polFirst == false ) {
					if ( data[0] != undefined ) {
						pol_lookup[data[0]] = polIndex;
					}

					politicians[polIndex] = {
						"id": polIndex,
						"name": data[0],
						"party": data[1],
						"commitee": data[2],
						"appointments": data[3],
						"private": data[4],
						"image": data[5],
						"link": data[6]
					};

					polIndex++;
				}
				polFirst = false;
			}).on("end", function(){
			 	callTrips();

			 	if ( politicians.length == 0 ) {
			 		console.log("POL; didn't run");
			 		return false;
			 	}

				fs.writeFile('data/politicians.json', JSON.stringify(politicians), function (err) {
					
				});
			});
		});
	});
}

function callTrips () {
	var tripsFile = fs.createWriteStream("data/trips.csv");
	https.get(tripsUrl, function(response) {
	  	var stream = response.pipe(tripsFile);

	  	stream.on('finish', function () {
		  	var tripIndex = 0;
			var tripFirst = true;

			csv
			.fromPath("data/trips.csv")
			.on("data", function(data){
			 	if ( tripFirst == false ) {
			 		var politiciansList = "";
			 		var crew = "";

			 		if ( data[4] != undefined ) {
			 			politiciansList = data[4].split(",");
			 		}

			 		tripPoliticians = [];

			 		politiciansList.forEach( function ( pol, ind ) {
			 			if ( pol != 0 && ind != undefined && politicians[pol_lookup[pol]] != undefined ) {
							tripPoliticians.push({
								"id": pol_lookup[pol],
								"name": politicians[pol_lookup[pol]]["name"]
							});
						}
			 		} );
					
					if ( data[3] == "Alle" ) {
						crew = "Alle";
					} else if ( data[3] != undefined && data[3].length > 1 ) {
			 			crew = data[3].split(",");
			 		}

			 		if ( crew == "" ) {
						crew = [];
			 		}

			 		var type = trip_mappings[data[5]];
			 		var title = "";
			 		var organizer = "";

			 		if ( data[6] != undefined && data[6] != "" ) {
						title = data[6];
			 		} else {
			 			title = data[5];
			 		}

			 		if ( data[7] != undefined && data[7] != "" ) {
						organizer = data[7];
			 		} else {
			 			organizer = "SCLEROSEFORENINGEN";
			 		}

					trips[tripIndex] = {
						"id": tripIndex,
						"day": data[0],
						"start": data[1],
						"end": data[2],
						"crew": crew,
						"politicians": tripPoliticians,
						"type_text": data[5],
						"type": type,
						"title": title,
						"organizer": organizer,
						"location": ( data[8] != undefined ) ? data[8] : ''
					};

					tripIndex++;
				}
				tripFirst = false;
			}).on("end", function(){
			 	callContacts();

			 	if ( trips.length == 0 ) {
			 		console.log("TRIPS didn't run");
			 		return false;
			 	}
			});
		});
	});
}

function callContacts () {
	var contactsFile = fs.createWriteStream("data/contacts.csv");
	https.get(contactsUrl, function(contactrResponse) {
		var stream = contactrResponse.pipe(contactsFile);

		stream.on('finish', function () {
			var contactIndex = 0;
			var contactFirst = true;

			csv
			.fromPath("data/contacts.csv")
			.on("data", function( contactData ){
				if ( contactFirst == false ) {
					if ( contactData[0] != "" ) {
						contacts_lookup[contactData[0]] = contactIndex;
					}
					
					if ( contactData[5] == "Delegation" ) {
						all.push(contactData[0]);
					}

					contacts[contactIndex] = {
						"id": contactIndex,
						"name": contactData[0],
						"email": contactData[3],
						"phone": contactData[2],
						"from": contactData[1],
						"cateogry": contactData[4],
						"group": contactData[5]
					};

					contactIndex++;
				}
				contactFirst = false;
			})
			.on("end", function(){
				callRes();

				if ( contacts.length == 0 ) {
					console.log("Contacts didn't run");
					return false;
				}

				fs.writeFile('data/contacts.json', JSON.stringify(contacts), function (err) {
				});
			});
		});
	});
}

function callRes () {
	var restaurantsFile = fs.createWriteStream("data/restaurants.csv");
	https.get(restaurantsUrl, function(resResponse, error) {
		var stream = resResponse.pipe(restaurantsFile);

		stream.on('finish', function () {
			var restaurantIndex = 0;
			var restaurantFirst = true;

			csv.fromPath('data/restaurants.csv').on("data", function( resData ){
				if ( restaurantFirst == false ) {
					var resElement = {
						"id": restaurantIndex,
						"day": resData[0],
						"meal": resData[1],
						"place": resData[2],
						"number_of_people": resData[3],
						"start": resData[4],
						"end": resData[5],
						"crew": "Alle"
					};

					restaurants[restaurantIndex] = resElement;

					restaurantIndex++;
				}
				restaurantFirst = false;
			}).on("end", function(){
				callHotels();

				if ( restaurants.length == 0 ) {
					console.log("Restaurants didn't run");
					return false;
				}

				fs.writeFile('data/restaurants.json', JSON.stringify(restaurants), function (err) {
					
				});
			});
		});
	});
}

function callHotels () {
	var hotelsFile = fs.createWriteStream("data/hotels.csv");
	https.get(hotelsUrl, function(response) {
		var stream = response.pipe(hotelsFile);

		stream.on('finish', function () {
			var hotelIndex = 0;
			var hotelFirst = true;

			csv
			.fromPath("data/hotels.csv")
			.on("data", function(data){
				if ( hotelFirst == false ) {
					var people = null;

					if ( data[4] != undefined ) {
						people = data[4].split(",")
					}

					var rooms = null;

					if ( data[3] != undefined ) {
						rooms = data[3].split(",")
					}

					hotels[hotelIndex] = {
						"id": hotelIndex,
						"name": data[0],
						"period": data[1],
						"address": data[2],
						"rooms": rooms,
						"people": people,
						"lat": data[5],
						"lng": data[6]
					};

					hotelIndex++;
				}
				hotelFirst = false;
			})
			.on("end", function(){
				callFerries();
				if ( hotels.length == 0 ) {
					return false;
				}

				fs.writeFile('data/hotels.json', JSON.stringify(hotels), function (err) {
					
				});
			});
		});
	});
}

function callFerries () {
	var ferriesFile = fs.createWriteStream("data/ferries.csv");
	https.get(ferriesUrl, function(ferriesResponse) {
		ferriesResponse.pipe(ferriesFile);

		var ferrieIndex = 0;
		var ferrieFirst = true;

		csv
		.fromPath("data/ferries.csv")
		.on("data", function(ferryData){
			console.log("FERRYDATA");
			if ( ferrieFirst == false ) {
				var ferryPeople = "";

				if ( ferryData[6] != undefined ) {
					ferryPeople = ferryData[6].split(",");
				}

				ferriesList[ferrieIndex] = {
					"id": ferrieIndex,
					"vehicles": ferryData[0].split(","),
					"day": ferryData[1],
					"from": ferryData[2],
					"to": ferryData[3],
					"time": ferryData[4],
					"people": ferryPeople,
					"title": "Færge",
					"start": ferryData[4],
					"end": ferryData[5]
				};

				ferrieIndex++;
			}
			ferrieFirst = false;
		})
		.on("end", function(){
			createPeople();

			if ( ferriesList.length == 0 ) {
				console.log("FERRIES didn't run");
				return false;
			}

			fs.writeFile('data/ferries.json', JSON.stringify(ferriesList), function (err) {
				
			});
		});
	});
}

function compare(a,b) {
	return new Date('1970/01/01 ' + a.start) - new Date('1970/01/01 ' + b.start);
}

function createPeople () {
	console.log("People did run");

	trips.forEach( function ( element, index ) {
		if ( element["crew"] == "Alle" ) {
			element["crew"] = all.slice(0);
		}

		element["crew"].forEach( function ( member, ind ) {
			if ( contacts_lookup[member] != undefined ) {
				var contact_id = contacts_lookup[member];

				element["crew"][ind] = {
					"name": member,
					"id": contact_id
				}

				if ( people[contact_id] == undefined ) {
					people[contact_id] = {
						"contact": contacts[contact_id],
						"activities": []
					}
				}
				
				element["type"] = trip_mappings[element["type_text"]];

				people[contact_id]["activities"].push(element);
			} else {
				trips[index]["crew"][ind] = {
					"name": member,
					"id": 00
				};
			}
		} );
	} );

	fs.writeFile('data/trips.json', JSON.stringify(trips), function (err) {
					
	});

	restaurants.forEach( function ( res, index ) {
		people.forEach( function ( pep, i ) {
			res["type"] = "restaurant";
			res["title"] = res["meal"];

			pep["activities"].push(res);
		} );
	} );

	ferriesList.forEach( function ( ferry, index ) {
		ferry["people"].forEach( function ( member, i ) {
			if ( contacts_lookup[member] != undefined ) {
				var contact_id = contacts_lookup[member];

				ferry["people"][i] = {
					"name": member,
					"id": contact_id
				}

				if ( people[contact_id] == undefined ) {
					people[contact_id] = {
						"contact": contacts[contact_id],
						"activities": []
					}
				}
				
				ferry["type"] = "ferry";

				people[contact_id]["activities"].push(ferry);
			} else {
				ferriesList[index]["people"][i] = {
					"name": member,
					"id": 00
				};
			}
		} );
	} );

	people.forEach( function ( pep, i ) {
		pep["activities"] = pep["activities"].sort(compare);
	} );

	if ( people.length == 0 ) {
		return false;
	}

	fs.writeFile('data/people.json', JSON.stringify(people), function (err) {
	});

	return true;
}