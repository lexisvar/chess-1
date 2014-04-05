define(function(require, exports, module) {
	var same = require("chai").assert.equal;
	var TimePeriod = require("../TimePeriod");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	var tests = {
		"parse() on empty string is 0 seconds":
		
		function() {
			same(TimePeriod.parse(""), 0);
		},
		
		"parse() on '1m' is 60 seconds":
		
		function() {
			same(TimePeriod.parse("1m"), 60);
		},
		
		"parse() on '1h' is 3600 seconds":
		
		function() {
			same(TimePeriod.parse("1h"), 3600);
		},
		
		"parse() on 1h3m is 3780":
		
		function() {
			same(TimePeriod.parse("1h3m"), 3780);
		},
		
		"parse() with random whitespace is correct":
		
		function() {
			same(TimePeriod.parse("   1  h3   m"), 3780);
		},
		
		"parse() with random whitespace, capitalisation and other letters is correct":
		
		function() {
			same(TimePeriod.parse("   25  H3   minuTES and 45 s  "), 90225);
		},
		
		"parse() with 1y is 31449600":
		
		function() {
			same(TimePeriod.parse("1y"), 31449600);
		},
		
		"parse() with 2y is 62899200":
		
		function() {
			same(TimePeriod.parse("2y"), 62899200);
		},
		
		"parse() with 2y 1s is 62899201":
		
		function() {
			same(TimePeriod.parse("2y 1s"), 62899201);
		},
		
		"encode() with 10 and default units of minutes is '10s'":
		
		function() {
			same(TimePeriod.encode(10, "m"), "10s");
		},
		
		"encode() with 100 and default units of minutes is '1m40s'":
		
		function() {
			same(TimePeriod.encode(100, "m"), "1m40s");
		},
		
		"encode() with 600 and default units of minutes is '10'":
		
		function() {
			same(TimePeriod.encode(600, "m"), "10");
		},
		
		"encode() with 600 and no default units is '10m'":
		
		function() {
			same(TimePeriod.encode(600), "10m");
		},
		
		"encode() with 86400 and no default units is '1d'":
		
		function() {
			same(TimePeriod.encode(86400), "1d");
		},
		
		"encode() with 86400 and default units 'd' is '1'":
		
		function() {
			same(TimePeriod.encode(86400, "d"), "1");
		},
		
		"encode() with 86401 and default units 's' is '1d1'":
		
		function() {
			same(TimePeriod.encode(86401, "s"), "1d1");
		},
		
		"getColonDisplay with 1000 is 0:01":
		
		function() {
			same(TimePeriod.getColonDisplay(1000), "0:01");
		},
		
		"getColonDisplay with 60000 is 1:00":
		
		function() {
			same(TimePeriod.getColonDisplay(60000), "1:00");
		},
		
		"getColonDisplay with 86400000 is 1:00:00:00":
		
		function() {
			same(TimePeriod.getColonDisplay(86400000), "1:00:00:00");
		},
		
		"getColonDisplay with 172800000 is 2:00:00:00":
		
		function() {
			same(TimePeriod.getColonDisplay(172800000), "2:00:00:00");
		},
		
		"getColonDisplay with 172800999 is 2:00:00:00":
		
		function() {
			same(TimePeriod.getColonDisplay(172800999), "2:00:00:00");
		},
		
		"getColonDisplay with 172800999 and displayTenths is 2:00:00:00.9":
		
		function() {
			same(TimePeriod.getColonDisplay(172800999, true), "2:00:00:00.9");
		}
	};
	
	var passed = 0;
	var failed = 0;
	
	for(var description in tests) {
		try {
			tests[description]();
			console.log("\033[0;32mpassed:\033[0m " + description);
			passed++;
		} catch(error) {
			console.log("\033[0;31mfailed:\033[0m " + description + ": " + error.message);
			throw error;
			failed++;
		}
	}
	
	console.log("\033[1m" + passed + " passed, " + failed + " failed\033[0m");
	console.log("");
});