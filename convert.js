var csv = require("fast-csv");
var fs = require('fs');
var https = require('https');

var index = 0;
var first = true;

var tripsUrl = "https://docs.google.com/spreadsheets/d/1MHx-MQmJlK622KasUkiUftnnWMV_qJF2wdJLuNhEsRQ/export?format=csv&id=1MHx-MQmJlK622KasUkiUftnnWMV_qJF2wdJLuNhEsRQ&gid=0";
var contactsUrl = "https://docs.google.com/spreadsheets/d/1Yp6mcxMrwb8icsdhSq0JKydmarGQxSULJ2x4O4kEKKI/export?format=csv&id=1Yp6mcxMrwb8icsdhSq0JKydmarGQxSULJ2x4O4kEKKI&gid=0";
var restaurantsUrl = "https://docs.google.com/spreadsheets/u/0/d/12QBIvAjcXxGoa6a3ehgUgJ-xaQjHTwo87lzYYCU8q6Y/export?format=csv&id=12QBIvAjcXxGoa6a3ehgUgJ-xaQjHTwo87lzYYCU8q6Y&gid=0";
var hotelsUrl = "https://docs.google.com/spreadsheets/u/0/d/1Pu3QzMz0sNM9SeLPrCKBLnGK5zT3f6anmmRdc_8nEIc/export?format=csv&id=1Pu3QzMz0sNM9SeLPrCKBLnGK5zT3f6anmmRdc_8nEIc&gid=0";
var ferriesUrl = "https://docs.google.com/spreadsheets/u/0/d/1C-YBTOwm-kjKByvuYTTjS73t5MmUhUkhKjCOKwtGDeM/export?format=csv&id=1C-YBTOwm-kjKByvuYTTjS73t5MmUhUkhKjCOKwtGDeM&gid=0";

var contacts = [];
var contacts_lookup = [];
var trips = [];
var restaurants = [];
var hotels = [];
var ferries = [];
var people = [];

callTrips();

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
			 		var politicians = "";
			 		var crew = "";
			 		var guests = "";

			 		if ( data[4] != undefined ) {
			 			politicians = data[4].split(",");
			 		}

			 		if ( data[3] != undefined ) {
			 			crew = data[3].split(",");
			 		}

			 		if ( data[5] != undefined ) {
			 			guests = data[5].split(",");
			 		}

					trips[tripIndex] = {
						"id": tripIndex,
						"day": data[0],
						"start": data[1],
						"end": data[2],
						"crew": crew,
						"politicians": politicians,
						"guests": guests
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

				fs.writeFile('data/trips.json', JSON.stringify(trips), function (err) {
					
				});
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
						"end": resData[5]
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
						"people": people
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

		ferrieIndex = 0;
		ferrieFirst = true;

		csv
		.fromPath("data/ferries.csv")
		.on("data", function(ferryData){
			if ( ferrieFirst == false ) {
				var ferryPeople = null;

				if ( ferryData[5] != undefined ) {
					ferryPeople = ferryData[5].split(",")
				}

				ferries[ferrieIndex] = {
					"id": ferrieIndex,
					"vehicles": ferryData[0].split(","),
					"day": ferryData[1],
					"from": ferryData[2],
					"to": ferryData[3],
					"time": ferryData[4],
					"people": ferryPeople
				};

				ferrieIndex++;
			}
			ferrieFirst = false;
		})
		.on("end", function(){
			createPeople();

			if ( ferries.length == 0 ) {
				console.log("FERRIES didn't run");
				return false;
			}

			fs.writeFile('data/ferries.json', JSON.stringify(ferries), function (err) {
				
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
		element["crew"].forEach( function ( member ) {
			if ( contacts_lookup[member] != undefined ) {
				var contact_id = contacts_lookup[member];

				if ( people[contact_id] == undefined ) {
					people[contact_id] = {
						"contact": contacts[contact_id],
						"activities": []
					}
				}

				element["type"] = "trip";

				people[contact_id]["activities"].push(element);
			}
		} );
	} );

	restaurants.forEach( function ( res, index ) {
		people.forEach( function ( pep, i ) {
			res["type"] = "restaurant";

			pep["activities"].push(res);
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
}