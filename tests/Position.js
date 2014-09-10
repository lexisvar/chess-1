define(function(require, exports, module) {
	var test = require("chai").assert;
	var Position = require("../Position");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	Square.forEach(function(square) {
		global[square.algebraic] = square;
	});
	
	var tests = {
		"getLegalMoves at the beginning is the 20 initial legal moves for white":
		
		function() {
			[ 'b1a3',
				'b1c3',
				'g1f3',
				'g1h3',
				'a2a4',
				'a2a3',
				'b2b4',
				'b2b3',
				'c2c4',
				'c2c3',
				'd2d4',
				'd2d3',
				'e2e4',
				'e2e3',
				'f2f4',
				'f2f3',
				'g2g4',
				'g2g3',
				'h2h4',
				'h2h3' ]//TODO
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