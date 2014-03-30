define(function(require, exports, module) {
	var test = require("chai").assert;
	var CastlingRights = require("../CastlingRights");
	var Colour = require("../Colour");
	
	console.log("\033[1m" + module.id + "\033[0m");
	
	var tests = {
		"a-file allowed for white has fen string 'Q'":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "a", true);
			
			test.equal(castlingRights.getFenString(), "Q");
		},
		
		"h-file allowed for white has fen string 'K'":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "h", true);
			test.equal(castlingRights.getFenString(), "K");
		},
		
		"a-file allowed for black has fen string 'q'":
		
		function(castlingRights) {
			castlingRights.set(Colour.black, "a", true);
			test.equal(castlingRights.getFenString(), "q");
		},
		
		"h-file allowed for black has fen string 'k'":
		
		function(castlingRights) {
			castlingRights.set(Colour.black, "h", true);
			test.equal(castlingRights.getFenString(), "k");
		},
		
		"f-file allowed for black has fen string '-'":
		
		function(castlingRights) {
			castlingRights.set(Colour.black, "f", true);
			test.equal(castlingRights.getFenString(), "-");
		},
		
		"f-file allowed for black has X-fen string 'f'":
		
		function(castlingRights) {
			castlingRights.set(Colour.black, "f", true);
			test.equal(castlingRights.getXFenString(), "f");
		},
		
		"f-file allowed for white has X-fen string 'F'":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "f", true);
			test.equal(castlingRights.getXFenString(), "F");
		},
		
		"f-file allowed for white and black has X-fen string 'Ff'":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "f", true);
			castlingRights.set(Colour.black, "f", true);
			test.equal(castlingRights.getXFenString(), "Ff");
		},
		
		"all allowed for both has fen string 'KQkq'":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "a", true);
			castlingRights.set(Colour.black, "a", true);
			castlingRights.set(Colour.white, "h", true);
			castlingRights.set(Colour.black, "h", true);
			test.equal(castlingRights.getFenString(), "KQkq");
		},
		
		"standard king and queenside for both has Xfen string 'AHah'":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "a", true);
			castlingRights.set(Colour.black, "a", true);
			castlingRights.set(Colour.white, "h", true);
			castlingRights.set(Colour.black, "h", true);
			test.equal(castlingRights.getXFenString(), "AHah");
		},
		
		"setting rights to allowed results in getting them returning true":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "a", true);
			test.equal(castlingRights.get(Colour.white, "a"), true);
			castlingRights.set(Colour.white, "a", false);
			test.equal(castlingRights.get(Colour.white, "a"), false);
			castlingRights.set(Colour.white, "a", true);
			test.equal(castlingRights.get(Colour.white, "a"), true);
			castlingRights.set(Colour.white, "K", true);
			test.equal(castlingRights.get(Colour.white, "h"), true);
			castlingRights.set(Colour.white, "Q", true);
			test.equal(castlingRights.get(Colour.white, "a"), true);
			castlingRights.set(Colour.white, "a", true);
			test.equal(castlingRights.get(Colour.white, "Q"), true);
		},
		
		"setting can be done with san strings or files":
		
		function(castlingRights) {
			castlingRights.set(Colour.white, "K", true);
			test.equal(castlingRights.get(Colour.white, "K"), true);
			test.equal(castlingRights.get(Colour.white, "h"), true);
		}
	};
	
	var passed = 0;
	var failed = 0;
	
	for(var description in tests) {
		try {
			tests[description](new CastlingRights());
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