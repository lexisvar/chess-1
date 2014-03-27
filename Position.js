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

		if(fen) {
			this.setFen(fen);
		}

		else {
			this.setFen(Fen.STARTING_FEN);
		}
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
	
	Position.prototype.getCastlingRightsBySide = function(colour, side) {
		return this._castlingRights.getBySide(colour, side);
	}
	
	Position.prototype.getCastlingRightsByFile = function(colour, file) {
		return this._castlingRights.getByFile(colour, file);
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
	
	Position.prototype.setCastlingRightsBySide = function(colour, side, allow) {
		this._castlingRights.setBySide(colour, side, allow);
	}
	
	Position.prototype.setCastlingRightsByFile = function(colour, file, allow) {
		this._castlingRights.setByFile(colour, file, allow);
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
		fen.active = Colour.getFen(this._activeColour);
		fen.castlingRights = this._castlingRights.getFenStringBySide();

		fen.epTarget = Fen.NONE;

		if(this._epTarget !== null) {
			fen.epTarget = Chess.algebraicFromSquare(this._epTarget);
		}

		fen.fiftymoveClock = this._fiftymoveClock.toString();
		fen.fullmove = this._fullmove.toString();

		return fen.toString();
	}

	Position.prototype.getAttackers = function(pieceType, square, colour) {
		if(pieceType === PieceType.pawn) {
			return this.getPawnAttackers(square, colour);
		}

		else if(pieceType === Piece.KING) {
			return this.getKingAttackers(square, colour);
		}

		else {
			return this.getRegularAttackers(pieceType, square, colour);
		}
	}

	Position.prototype.getPawnAttackers = function(square, colour) {
		var attackers = [];
		var piece = Piece.getPiece(PieceType.pawn, colour);
		var playerColour = Colour.getOpposite(colour);
		var relSquare = Chess.getRelativeSquare(square, playerColour);
		var relCoords = Chess.coordsFromSquare(relSquare);
		var xDiffs = [-1, 1];
		var xDiff;
		var x, y, candidateSquare;

		for(var i = 0; i < xDiffs.length; i++) {
			xDiff = xDiffs[i];
			x = relCoords.x + xDiff;
			y = relCoords.y + 1;

			if(x > -1 && x < 8 && y > -1 && y < 8) {
				candidateSquare = Chess.getRelativeSquare(Chess.squareFromCoords({
					x: x,
					y: y
				}), playerColour);

				if(this._board.getPiece(candidateSquare) === piece) {
					attackers.push(candidateSquare);
				}
			}
		}

		return attackers;
	}

	Position.prototype.getKingAttackers = function(square, colour) {
		var attackers = [];
		var piece = Piece.getPiece(Piece.KING, colour);
		var coords = Chess.coordsFromSquare(square);
		var x, y, candidateSquare;

		for(var xDiff = -1; xDiff<2; xDiff++) {
			x = coords.x + xDiff;

			if(x>-1 && x<8) {
				for(var yDiff = -1; yDiff < 2; yDiff++) {
					y = coords.y + yDiff;

					if(y > -1 && y < 8) {
						candidateSquare = Chess.squareFromCoords({
							x: x,
							y: y
						});

						if(this._board.getPiece(candidateSquare) === piece) {
							attackers.push(candidateSquare);
						}
					}
				}
			}
		}

		return attackers;
	}

	Position.prototype.getRegularAttackers = function(pieceType, square, colour) {
		var attackers = [];
		var piece = Piece.get(pieceType, colour);
		var candidateSquares = Board.getReachableSquares(pieceType, square, colour);
		var candidateSquare;

		for(var i = 0; i < candidateSquares.length; i++) {
			candidateSquare = candidateSquares[i];

			if(this._board.getPiece(candidateSquare) === piece && !this.moveIsBlocked(square, candidateSquare)) {
				attackers.push(candidateSquare);
			}
		}

		return attackers;
	}

	Position.prototype.getAllAttackers = function(square, colour) {
		var attackers = [];
		var pieceTypes = [PieceType.pawn, PieceType.knight, PieceType.bishop, Piece.ROOK, Piece.QUEEN, Piece.KING];

		for(var i = 0; i < pieceTypes.length; i++) {
			attackers = attackers.concat(this.getAttackers(pieceTypes[i], square, colour));
		}

		return attackers;
	}

	Position.prototype.getCopy = function() {
		return new Position(this.getFen());
	}

	Position.prototype.playerIsInCheck = function(colour) {
		return (this.getAllAttackers(
			this._board.getKingPosition(colour),
			colour.opposite
		).length > 0);
	}

	Position.prototype.playerIsMated = function(colour) {
		return (this.playerIsInCheck(colour) && this.countLegalMoves(colour) === 0);
	}

	Position.prototype.playerCanMate = function(colour) {
		var pieces = {};
		var bishops = {};
		var knights = {};

		pieces[PieceType.knight] = 0;
		pieces[PieceType.bishop] = 0;
		bishops[Colour.white] = 0;
		bishops[Colour.black] = 0;
		knights[Colour.white] = 0;
		knights[Colour.black] = 0;

		var piece;

		for(var square = 0; square < 64; square++) {
			piece = new Piece(this._board.getPiece(square));

			if(piece.type !== null && piece.type !== Piece.KING) {
				if(
					piece.colour === colour
					&& ([PieceType.pawn, PieceType.rook, PieceType.queen].indexOf(piece.type) !== -1)
				) {
					return true;
				}

				if(piece.type === PieceType.bishop) {
					bishops[piece.colour]++;
					pieces[PieceType.bishop]++;
				}

				if(piece.type === PieceType.knight) {
					knights[piece.colour]++;
					pieces[PieceType.knight]++;
				}
			}
		}

		return (
			(bishops[Colour.white] > 0 && bishops[Colour.black] > 0)
			|| (pieces[PieceType.bishop] > 0 && pieces[PieceType.knight] > 0)
			|| (pieces[PieceType.knight] > 2 && knights[colour] > 0)
		);
	}

	Position.prototype.countLegalMoves = function(colour) {
		var legalMoves = 0;
		var piece;

		for(var square = 0; square < 64; square++) {
			piece = this._board.getPiece(square);

			if(piece !== null && piece.colour === colour) {
				legalMoves += this.getLegalMovesFromSquare(square).length;
			}
		}

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

	Position.prototype.moveIsBlocked = function(from, to) {
		var squares = /*FIXME*/Chess.getPiecesBetween(from, to);

		for(var i = 0; i < squares.length; i++) {
			if(this._board.getPiece(squares[i]) !== null) {
				return true;
			}
		}

		return false;
	}

	return Position;
});