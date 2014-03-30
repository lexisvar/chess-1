define(function(require, exports, module) {
	var test = require("chai").assert;
	var Board = require("../Board");
	var Square = require("../Square");
	var PieceType = require("../PieceType");
	var Piece = require("../Piece");
	var Colour = require("../Colour");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	Square.forEach(function(square) {
		global[square.algebraic] = square;
	});
	
	var tests = {
		"getReachableSquares for a white pawn on a2 is a3, a4, b3":
		
		function() {
			test.deepEqual(Board.getReachableSquares(PieceType.pawn, a2, Colour.white), [a4, a3, b3]);
		},
		
		"getReachableSquares for a knight on b1 is a3, c3, d2":
		
		function() {
			test.deepEqual(Board.getReachableSquares(PieceType.knight, b1, Colour.white), [a3, c3, d2]);
		},
		
		"getSquaresBetween c1 and a3 is [b2]":
		
		function() {
			test.deepEqual(Board.getSquaresBetween(c1, a3), [b2]);
		}
	};
	
	var passed = 0;
	var failed = 0;
	
	for(var description in tests) {
		try {
			tests[description](new Board());
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