define(function(require, exports, module) {
	var test = require("chai").assert;
	var Move = require("../Move");
	var Position = require("../Position");
	var Square = require("../Square");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	for(var i = 0; i < 64; i++) {
		global[Square.bySquareNo[i].algebraic] = Square.bySquareNo[i];
	}
	
	var tests = {
		"disambiguation: rook on a1, rook on a3, a1-a2 label is R1a2":
		
		function() {
			var move = new Move(new Position("5k1K/8/8/8/8/R7/8/R7 w - - 1 0"), a1, a2);
			
			test.equal(move.getLabel(), "R1a2");
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