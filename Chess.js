define(function(require) {
	var Piece = require("chess/Piece");

	var Chess = {
		RANKS: "12345678",
		FILES: "abcdefgh",

		KING_HOME_SQUARE_WHITE: 4,
		KING_HOME_SQUARE_BLACK: 60,

		isRegularMove: function(type, fromCoords, toCoords) {
			var diff = {
				x: Math.abs(fromCoords.x - toCoords.x),
				y: Math.abs(fromCoords.y - toCoords.y)
			};

			if(diff.x === 0 && diff.y === 0) {
				return false;
			}

			switch(type) {
				case Piece.PAWN: {
					return false;
				}

				case Piece.KNIGHT: {
					return ((diff.x === 2 && diff.y === 1) || (diff.x === 1 && diff.y === 2));
				}

				case Piece.BISHOP: {
					return (diff.x === diff.y);
				}

				case Piece.ROOK: {
					return (diff.x === 0 || diff.y === 0);
				}

				case Piece.QUEEN: {
					return (diff.x === diff.y || (diff.x === 0 || diff.y === 0));
				}

				case Piece.KING: {
					return ((diff.x === 1 || diff.x === 0) && (diff.y === 1 || diff.y === 0));
				}
			}
		},

		isPawnMove: function(relFrom, relTo) {
			return (relTo-relFrom === 8);
		},

		isDoublePawnMove: function(relFrom, relTo) {
			return (relFrom > 7 && relFrom < 16 && relTo - relFrom === 16);
		},

		isPawnCapture: function(relFrom , relTo) {
			var fromCoords = Chess.coordsFromSquare(relFrom);
			var toCoords = Chess.coordsFromSquare(relTo);

			return (toCoords.y - fromCoords.y === 1 && Math.abs(toCoords.x - fromCoords.x) === 1);
		},

		isPawnPromotion: function(relTo) {
			return (relTo > 55);
		},

		getEpPawn: function(capturerFrom, capturerTo) {
			return Chess.squareFromCoords({
				x: Chess.xFromSquare(capturerTo),
				y: Chess.yFromSquare(capturerFrom)
			});
		},

		
	};

	return Chess;
});