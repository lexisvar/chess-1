define(function(require, exports, module) {
	var test = require("chai").assert;
	var Board = require("../Board");
	var Square = require("../Square");
	var PieceType = require("../PieceType");
	var Piece = require("../Piece");
	var Colour = require("../Colour");
	var Fen = require("../Fen");
	
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
		},
		
		"getSquaresBetween e2 and e5 is [e3, e4]":
		
		function() {
			test.deepEqual(Board.getSquaresBetween(e2, e5), [e3, e4]);
		},
		
		"getSquaresBetween a4 and h4 is [b4, c4, d4, e4, f4, g4]":
		
		function() {
			test.deepEqual(Board.getSquaresBetween(a4, h4), [b4, c4, d4, e4, f4, g4]);
		},
		
		"getSquaresBetween b6 and c8 is []":
		
		function() {
			test.deepEqual(Board.getSquaresBetween(b6, c8), []);
		},
		
		"rook moves jumping over pawns in start position are blocked":
		
		function(board) {
			test.equal(board.moveIsBlocked(a1, a3), true);
			test.equal(board.moveIsBlocked(h1, h3), true);
			test.equal(board.moveIsBlocked(a8, a6), true);
			test.equal(board.moveIsBlocked(h8, h6), true);
		},
		
		"e2e4 is not blocked":
		
		function(board) {
			test.equal(board.moveIsBlocked(e2, e4), false);
		},
		
		"knight moves are not blocked":
		
		function(board) {
			test.equal(board.moveIsBlocked(b1, c3), false);
			test.equal(board.moveIsBlocked(b1, a3), false);
			test.equal(board.moveIsBlocked(g1, f3), false);
			test.equal(board.moveIsBlocked(g1, h3), false);
		},
		
		"en passant pawn is e4 for ep capture from d4 to e3":
		
		function() {
			test.equal(Board.getEpPawn(d4, e3), e4);
		}
	};
	
	var passed = 0;
	var failed = 0;
	
	var fen = new Fen();
	var board;
	
	for(var description in tests) {
		try {
			board = new Board();
			board.setBoardArray(Fen.boardArrayFromFenPosition(fen.position));
			tests[description](board);
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