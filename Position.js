define(function(require) {
	var clone = require("js/clone");
	var Colour = require("./Colour");
	var PieceType = require("./PieceType");
	var Piece = require("./Piece");
	var Move = require("./Move");
	var Square = require("./Square");
	var getInitialBoard = require("./getInitialBoard");
	
	function Position() {
		this.board = getInitialBoard();
		this.castlingRights = {K: true, Q: true, k: true, q: true};
		this.activeColour = Colour.white;
		this.epTarget = epTarget || null;
		this.fiftymoveClock = 0;
		this.fullmove = 1;
		this.kingPositions = {w: Square.byAlgebraic.e1, b: Square.byAlgebraic.e8};
	}
	
	Position.prototype.setPiece = function(square, piece) {
		this.board[square.squareNo] = piece;
		
		if(piece.type === PieceType.king) {
			this.kingPositions[piece.colour] = square;
		}
	}

	Position.prototype.getCopy = function() {
		return new Position(
			this.board,
			clone(this.castlingRights),
			this.activeColour,
			this.fiftymoveClock,
			this.fullmove
		);
	}

	Position.prototype.playerIsMated = function(colour) {
		return (this.playerIsInCheck(colour) && this.countLegalMoves(colour) === 0);
	}
	
	Position.prototype.getLegalMoves = function() {
		var legalMoves = [];

		for(var i = 0; i < 64; i++) {
			var from = Square.bySquareNo[i];
			var piece = this.board[i];

			if(piece !== null && piece.colour === this._activeColour) {
				legalMoves = legalMoves.concat(this.getLegalMovesFromSquare(from).map(function(to) {
					return {
						from: from,
						to: to
					};
				}));
			}
		}

		return legalMoves;
	}

	Position.prototype.countLegalMoves = function() {
		var legalMoves = 0;
		var piece, square;

		for(var i = 0; i < 64; i++) {
			square = Square.bySquareNo[i];
			piece = this.board[i];

			if(piece !== null && piece.colour === this.activeColour) {
				legalMoves += this.getLegalMovesFromSquare(i).length;
			}
		}

		return legalMoves;
	}

	Position.prototype.getLegalMovesFromSquare = function(square) {
		var legalMoves = [];
		var piece = this.board[square.squareNo];
		var reachableSquares;

		if(piece !== null) {
			reachableSquares = Position.getReachableSquares(piece.type, square, piece.colour);

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