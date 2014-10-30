define(function(require) {
	var Piece = require("./Piece");

	function Fen(fenString) {
		fenString = fenString || Fen.STARTING_FEN;

		var array = fenString.split(/\s+/);

		this.position = array[0];
		this.active = array[1];
		this.castlingRights = array[2];
		this.epTarget = array[3];
		this.fiftymoveClock = "0";
		this.fullmove = "1";

		if(array.length > 4) {
			this.fiftymoveClock = array[4];
		}

		if(array.length > 5) {
			this.fullmove = array[5];
		}
	}

	Fen.prototype.toString = function() {
		return [
			this.position,
			this.active,
			this.castlingRights,
			this.epTarget,
			this.fiftymoveClock,
			this.fullmove
		].join(" ");
	}

	Fen.STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	Fen.NONE = "-";
	Fen.ACTIVE_WHITE = "w";
	Fen.ACTIVE_BLACK = "b";
	Fen.WHITE_CASTLE_KS = "K";
	Fen.WHITE_CASTLE_QS = "Q";
	Fen.BLACK_CASTLE_KS = "k";
	Fen.BLACK_CASTLE_QS = "q";

	Fen.boardArrayFromFenPosition = function(fenPosition) {
		var board = [];
		var ranks = fenPosition.split("/").reverse();
		var fenChar;

		for(i = 0; i < 8; i++) {
			for(var j = 0; j < ranks[i].length; j++) {
				fenChar = ranks[i].charAt(j);

				if(fenChar.match(/[pnbrqk]/i)) {
					board.push(Piece.byFenString[fenChar]);
				}

				else if(fenChar.match(/\d/)) {
					for(var k = 0; k < parseInt(fenChar); k++) {
						board.push(null);
					}
				}
			}
		}

		return board;
	}

	Fen.fenPositionFromBoardArray = function(board) {
		var fenRanks = [];
		var ranks = [];

		for(var i = 56; i > -1; i -= 8) {
			ranks.push(board.slice(i, i + 8));
		}

		var fenRank;
		var piece;
		var emptySquares;

		for(var i = 0; i < 8; i++) {
			emptySquares = 0;
			fenRank = "";

			for(var j = 0; j < 8; j++) {
				piece = ranks[i][j];

				if(piece === null) {
					emptySquares++;
				}

				if(emptySquares > 0 && (piece !== null || j === 7)) {
					fenRank += emptySquares;
					emptySquares = 0;
				}

				if(piece !== null) {
					fenRank += piece.fenString;
				}
			}

			fenRanks.push(fenRank);
		}

		return fenRanks.join("/");
	}

	return Fen;
});