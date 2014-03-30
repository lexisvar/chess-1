define(function(require, exports, module) {
	var test = require("chai").assert;
	var Game = require("../Game");
	var Square = require("../Square");
	var PieceType = require("../PieceType");
	var Piece = require("../Piece");
	var Colour = require("../Colour");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	var tests = {
		"white can move from d2 to d4 at the beginning of a standard game":
		
		function(game) {
			game.move(Square.fromAlgebraic("d2"), Square.fromAlgebraic("d4"));
			test.equal(game.getPosition().getPiece(Square.fromAlgebraic("d2")), null);
			test.equal(game.getPosition().getPiece(Square.fromAlgebraic("d4")), Piece.get(PieceType.pawn, Colour.white));
			test.equal(game.getPosition().getActiveColour(), Colour.black);
			test.equal(game.getPosition().getFiftymoveClock(), 0);
			test.equal(game.getPosition().getEpTarget(), Square.fromAlgebraic("d3"));
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
			failed++;
		}
	}
	
	console.log("\033[1m" + passed + " passed, " + failed + " failed\033[0m");
	console.log("");
});