var csv = require("fast-csv");
var fs = require('fs');

var index = 0;
var first = true;

var contacts = [];

csv
 .fromPath("data/contacts.csv")
 .on("data", function(data){
 	if ( first == false ) {
		contacts[index] = {
			"id": index,
			"name": data[0],
			"email": data[3],
			"phone": data[2],
			"from": data[1],
			"cateogry": data[4],
			"group": data[5]
		};

		index++;
	}
	first = false;
 })
 .on("end", function(){
	fs.writeFile('data/contacts.json', JSON.stringify(contacts), function (err) {
		
	});
 });

tripIndex = 0;
tripFirst = true;

var trips = [];

csv
 .fromPath("data/trips.csv")
 .on("data", function(data){
 	if ( tripFirst == false ) {
		trips[tripIndex] = {
			"id": tripIndex,
			"day": data[0],
			"start": data[1],
			"end": data[2],
			"crew": data[3],
			"politicians": data[4],
			"guests": data[5]
		};

		tripIndex++;
	}
	tripFirst = false;
 })
 .on("end", function(){
	fs.writeFile('data/trips.json', JSON.stringify(trips), function (err) {
		
	});
 });