define(function(require, exports, module) {
	var test = require("chai").assert;
	var Square = require("../Square");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	Square.forEach(function(square) {
		global[square.algebraic] = square;
	});
	
	var tests = {
		"h1 is a light square":
		
		function() {
			test.equal(Square.h1.colour, Square.colours.LIGHT);
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