define(function(require) {
	var Fen = require("./Fen");
	
	function Colour(fenString) {
		this.fenString = fenString;
		this.name = (this.fenString === Fen.WHITE ? "white" : "black");
	}
	
	Colour.prototype.toString = function() {
		return this.fenString;
	}

	var white = new Colour(Fen.WHITE);
	var black = new Colour(Fen.BLACK);
	
	white.opposite = black;
	black.opposite = white;

	return {
		white: white,
		black: black
	};
});