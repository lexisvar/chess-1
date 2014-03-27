define(function(require) {
	var Fen = require("./Fen");
	var Chess = require("./Chess");
	var PieceType = require("./PieceType");
	var Piece = require("./Piece");
	var Colour = require("./Colour");

	function CastlingRights() {
		this._rightsByFile = {};
		this._rightsByFile[Colour.white] = [];
		this._rightsByFile[Colour.black] = [];

		this.reset();
	}

	CastlingRights.KINGSIDE = "K";
	CastlingRights.QUEENSIDE = "Q";

	var files = {
		"K": 7,
		"Q": 0
	};

	CastlingRights.prototype.reset = function() {
		for(var file = 0; file < 8; file++) {
			Colour.forEach((function(colour) {
				this._rightsByFile[colour][file] = false;
			}).bind(this));
		}
	}

	CastlingRights.prototype.setByFile = function(colour, file, allow) {
		this._rightsByFile[colour][file] = allow;
	}

	CastlingRights.prototype.setBySide = function(colour, side, allow) {
		this._rightsByFile[colour][files[side]] = allow;
	}

	CastlingRights.prototype.getByFile = function(colour, file) {
		return this._rightsByFile[colour][file];
	}

	CastlingRights.prototype.getBySide = function(colour, side) {
		return this._rightsByFile[colour][files[side]];
	}

	CastlingRights.prototype.setFenString = function(fenString) {
		this.reset();

		if(fenString !== Fen.NONE) {
			var fenChar, fenCharLower, fenCharUpper;
			var colour, file;

			for(var i = 0; i < fenString.length; i++) {
				fenChar = fenString.charAt(i);
				fenCharLower = fenChar.toLowerCase();
				fenCharUpper = fenChar.toUpperCase();
				colour = (fenChar === fenCharUpper ? Colour.white : Colour.black);

				if(fenCharUpper in files) {
					file = files[fenCharUpper];
				}

				else {
					file = "abcdefgh".indexOf(fenCharLower);
				}

				this.setByFile(colour, file, true);
			}
		}
	}

	CastlingRights.prototype.getFenStringByFile = function() {
		var fenString = "";

		Colour.forEach((function(colour) {
			for(var file = 0; file < 8; file++) {
				if(this.getByFile(colour, file)) {
					fenString += CastlingRights._getFileChar(colour, file);
				}
			}
		}).bind(this));

		if(fenString === "") {
			fenString = Fen.NONE;
		}

		return fenString;
	}

	CastlingRights.prototype.getFenStringBySide = function() {
		var colours = [Colour.white, Colour.black];
		var sides = [CastlingRights.KINGSIDE, CastlingRights.QUEENSIDE];
		var colour, side;
		var fenString = "";

		for(var i = 0; i < colours.length; i++) {
			colour = colours[i];

			for(var j = 0; j < sides.length; j++) {
				side = sides[j];

				if(this.getBySide(colour, side)) {
					fenString += CastlingRights._getSideChar(colour, side);
				}
			}
		}

		if(fenString === "") {
			fenString = Fen.NONE;
		}

		return fenString;
	}

	CastlingRights._getSideChar = function(colour, side) {
		var pieceTypes = []

		pieceTypes[CastlingRights.KINGSIDE] = Piece.KING;
		pieceTypes[CastlingRights.QUEENSIDE] = Piece.QUEEN;

		return Fen.getPieceChar(Piece.getPiece(pieceTypes[side], colour));
	}

	CastlingRights._getFileChar = function(colour, file) {
		var fenChar = "abcdefgh".charAt(file);

		if(colour === Colour.white) {
			fenChar = fenChar.toUpperCase();
		}

		return fenChar;
	}

	return CastlingRights;
});