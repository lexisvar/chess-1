define(function(require) {
	var Colour = require("./Colour");
	
	function Piece(type, colour) {
		this.fenString = (colour === Colour.white ? type : type.toLowerCase());
		this.type = type;
		this.colour = colour;
		this.value = Piece.values[this.type];
	}
	
	Piece.prototype.toString = function() {
		return this.fenString;
	}
	
	Piece.types = {
		PAWN: Fen.PAWN,
		KNIGHT: Fen.KNIGHT,
		BISHOP: Fen.BISHOP,
		ROOK: Fen.ROOK,
		QUEEN: Fen.QUEEN,
		KING: Fen.KING
	};
	
	Piece.typesByFen = {};
	
	Piece.typesByFen[Fen.PAWN] = Piece.types.PAWN;
	Piece.typesByFen[Fen.KNIGHT] = Piece.types.KNIGHT;
	Piece.typesByFen[Fen.BISHOP] = Piece.types.BISHOP;
	Piece.typesByFen[Fen.ROOK] = Piece.types.ROOK;
	Piece.typesByFen[Fen.QUEEN] = Piece.types.QUEEN;
	Piece.typesByFen[Fen.KING] = Piece.types.KING;
	
	Piece.values = {};

	Piece.values[Piece.types.PAWN] = 1;
	Piece.values[Piece.types.KNIGHT] = 3;
	Piece.values[Piece.types.BISHOP] = 3;
	Piece.values[Piece.types.ROOK] = 5;
	Piece.values[Piece.types.QUEEN] = 9;
	
	var pieces = {};
	var type;
	
	for(var p in Piece.types) {
		type = Piece.types[p];
		pieces[type] = {};
		
		Colour.forEach(function(colour) {
			pieces[type][colour] = new Piece(type, colour);
		});
	}

	return {
		get: function(type, colour) {
			return pieces[type][colour];
		},
		
		fromFen: function(fenString) {
			return piecesByFenString[fenString];
		}
	};
});