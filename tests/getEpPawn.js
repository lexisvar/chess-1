define(function(require, exports, module) {
	var runTests = require("test-runner/runTests");
	var test = require("chai").assert;
	var getEpPawn = require("../getEpPawn");
	require("./globalSquares");
	
	for(var i = 0; i < 64; i++) {
		global[Square.bySquareNo[i].algebraic] = Square.bySquareNo[i];
	}
	
	var tests = {
		"en passant pawn is on e4 for an en passant capture from d4 to e3":
		
		function() {
			test.equal(getEpPawn(d4, e3), e4);
		}
	};
	
	runTests(module.id, tests);
});