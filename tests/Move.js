define(function(require, exports, module) {
	var test = require("chai").assert;
	var Move = require("../Move");
	var Position = require("../Position");
	var Square = require("../Square");
	var runTests = require("test-runner/runTests");
	require("./globalSquares");
	
	var tests = {
		"disambiguation: rook on a1, rook on a3, a1-a2 label is R1a2":
		
		function() {
			var move = new Move(new Position("5k1K/8/8/8/8/R7/8/R7 w - - 1 0"), a1, a2);
			
			move.generateLabels();
			
			test.equal(move.label, "R1a2");
		}
	};
	
	runTests(module.id, tests);
});