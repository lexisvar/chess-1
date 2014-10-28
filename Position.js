define(function(require) {
	var Fen = require("./Fen");
	var CastlingRights = require("./CastlingRights");
	var Board = require("./Board");
	var Colour = require("./Colour");
	var PieceType = require("./PieceType");
	var Piece = require("./Piece");
	var Move = require("./Move");
	var Square = require("./Square");

	function Position(fen) {
		this._board = new Board();
		this._castlingRights = new CastlingRights();
		this._activeColour = Colour.white;
		this._epTarget = null;
		this._fiftymoveClock = 0;
		this._fullmove = 1;

		this.setFen(fen || Fen.STARTING_FEN);
	}
	
	Position.prototype.getBoardArray = function() {
		return this._board.getBoardArray();
	}
	
	Position.prototype.getPiece = function(square) {
		return this._board.getPiece(square);
	}
	
	Position.prototype.setPiece = function(square, piece) {
		this._board.setPiece(square, piece);
	}
	
	Position.prototype.getActiveColour = function() {
		return this._activeColour;
	}
	
	Position.prototype.getCastlingRights = function(colour, fileOrSan) {
		return this._castlingRights.get(colour, fileOrSan);
	}
	
	Position.prototype.getEpTarget = function() {
		return this._epTarget;
	}
	
	Position.prototype.getFiftymoveClock = function() {
		return this._fiftymoveClock;
	}
	
	Position.prototype.getFullmove = function() {
		return this._fullmove;
	}
	
	Position.prototype.setCastlingRights = function(colour, fileOrSan, allow) {
		this._castlingRights.set(colour, fileOrSan, allow);
	}
	
	Position.prototype.setActiveColour = function(colour) {
		this._activeColour = colour;
	}
	
	Position.prototype.setEpTarget = function(square) {
		this._epTarget = square;
	}
	
	Position.prototype.setFullmove = function(fullmove) {
		this._fullmove = fullmove;
	}
	
	Position.prototype.incrementFullmove = function() {
		this._fullmove++;
	}
	
	Position.prototype.incrementFiftymoveClock = function() {
		this._fiftymoveClock++;
	}
	
	Position.prototype.resetFiftymoveClock = function() {
		this._fiftymoveClock = 0;
	}

	Position.prototype.setFen = function(fenString) {
		var fen = new Fen(fenString);

		this._activeColour = Colour.fromFenString(fen.active);
		this._castlingRights.setFenString(fen.castlingRights);

		if(fen.epTarget === Fen.NONE) {
			this._epTarget = null;
		}

		else {
			this._epTarget = Square.fromAlgebraic(fen.epTarget);
		}

		this._fiftymoveClock = parseInt(fen.fiftymoveClock);
		this._fullmove = parseInt(fen.fullmove);

		this._board.setBoardArray(Fen.boardArrayFromFenPosition(fen.position));
	}

	Position.prototype.getFen = function() {
		var fen = new Fen();

		fen.position = Fen.fenPositionFromBoardArray(this._board.getBoardArray());
		fen.active = this._activeColour.fenString;
		fen.castlingRights = this._castlingRights.getFenString();

		fen.epTarget = Fen.NONE;

		if(this._epTarget !== null) {
			fen.epTarget = this._epTarget.algebraic;
		}

		fen.fiftymoveClock = this._fiftymoveClock.toString();
		fen.fullmove = this._fullmove.toString();

		return fen.toString();
	}

	Position.prototype.getCopy = function() {
		return new Position(this.getFen());
	}

	Position.prototype.playerIsMated = function(colour) {
		return (this.playerIsInCheck(colour) && this.countLegalMoves(colour) === 0);
	}
	
	Position.prototype.getLegalMoves = function() {
		var legalMoves = [];

		Square.forEach((function(from) {
			var piece = this._board.getPiece(from);

			if(piece !== null && piece.colour === this._activeColour) {
				legalMoves = legalMoves.concat(this.getLegalMovesFromSquare(from).map(function(to) {
					return {
						from: from,
						to: to
					};
				}));
			}
		}).bind(this));

		return legalMoves;
	}

	Position.prototype.countLegalMoves = function() {
		var legalMoves = 0;
		var piece;

		Square.forEach((function(square) {
			piece = this._board.getPiece(square);

			if(piece !== null && piece.colour === this._activeColour) {
				legalMoves += this.getLegalMovesFromSquare(square).length;
			}
		}).bind(this));

		return legalMoves;
	}

	Position.prototype.getLegalMovesFromSquare = function(square) {
		var legalMoves = [];
		var piece = this._board.getPiece(square);
		var reachableSquares;

		if(piece !== null) {
			reachableSquares = Board.getReachableSquares(piece.type, square, piece.colour);

			for(var i = 0; i < reachableSquares.length; i++) {
				if((new Move(this, square, reachableSquares[i])).isLegal()) {
					legalMoves.push(reachableSquares[i]);
				}
			}
		}
		
		return legalMoves;
	}
	
	Position.prototype.getAllAttackers = function(square, colour) {
		return this._board.getAllAttackers(square, colour);
	}
	
	Position.prototype.getAttackers = function(pieceType, square, colour) {
		return this._board.getAttackers(pieceType, square, colour);
	}

	Position.prototype.playerCanMate = function(colour) {
		return this._board.playerCanMate(colour);
	}

	Position.prototype.moveIsBlocked = function(from, to) {
		return this._board.moveIsBlocked(from, to);
	}
	
	Position.prototype.playerIsInCheck = function(colour) {
		return this._board.playerIsInCheck(colour);
	}

	return Position;
});