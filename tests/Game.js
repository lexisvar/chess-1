define(function(require, exports, module) {
	var test = require("chai").assert;
	var Game = require("../Game");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	var tests = {
		"game can be logged to the console":
		
		function(game) {
			console.log(game);
		}
	};
	
	var passed = 0;
	var failed = 0;
	
	for(var description in tests) {
		try {
			tests[description](new Game());
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