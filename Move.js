define(function(require) {
	var time = require("lib/time");
	var Colour = require("./Colour");
	var PieceType = require("./PieceType");
	var Piece = require("./Piece");
	var MoveLabel = require("./MoveLabel");
	var Fen = require("./Fen");
	var CastlingDetails = require("./CastlingDetails");
	var Squares = require("./Squares");
	var Board = require("./Board");

	function Move(positionBefore, from, to, promoteTo) {
		this._positionBefore = positionBefore;
		this._from = from;
		this._to = to;
		this._promoteTo = promoteTo || Piece.types.QUEEN;
		this._positionAfter = this._positionBefore.getCopy();
		this._time = time();

		this._piece = this._positionBefore.getPiece(this._from);
		this._targetPiece = this._positionBefore.getPiece(this._to);
		this._capturedPiece = null;

		this._colour = this._positionBefore.getActiveColour();
		
		this._relFrom = Squares.fromRelativeSquareNo(this._from.squareNo, this._colour);
		this._relTo = Squares.fromRelativeSquareNo(this._to.squareNo, this._colour);

		this._label = new MoveLabel();
		this._isCastling = false;
		this._isPromotion = false;

		this._isUnobstructed = (
			!this._positionBefore.moveIsBlocked(this._from, this._to)
			&& (this._targetPiece === null || this._targetPiece.colour === this._colour.opposite)
		);

		this._isValid = false;
		this._isLegal = false;

		this._isCheck = false;
		this._isMate = false;
		this._hasCheckedForCheck = false;
		this._hasCheckedForMate = false;

		this._check();
	}

	Move.prototype._check = function() {
		if(this._piece !== null && this._piece.colour === this._colour) {
			if(this._piece.type === PieceType.pawn) {
				this._checkPawnMove();
			}

			else if(this._piece.type === PieceType.king) {
				this._checkKingMove();
			}

			else {
				this._checkRegularMove();
			}

			this._isLegal = (this._isValid && !this._positionAfter.playerIsInCheck(this._colour));

			if(this._isLegal) {
				if(this._colour === Colour.black) {
					this._positionAfter.incrementFullmove();
				}

				this._positionAfter.setActiveColour(this._colour.opposite);

				if(this._capturedPiece !== null || this._piece.type === PieceType.pawn) {
					this._positionAfter.resetFiftymoveClock();
				}

				else {
					this._positionAfter.incrementFiftymoveClock();
				}

				if(this._piece.type !== PieceType.pawn || !Board.isDoublePawnMove(this._relFrom, this._relTo)) {
					this._positionAfter.setEpTarget(null);
				}

				if(this._piece.type === PieceType.king || this._isCastling) {
					for(file = 0; file < 8; file++) {
						this._positionAfter.setCastlingRightsByFile(this._colour, file, false);
					}
				}

				else if(this._piece.type === PieceType.rook) {
					this._positionAfter.setCastlingRightsByFile(this._colour, this._from.coords.x, false);
				}
			}
		}
	}

	Move.prototype._checkRegularMove = function() {
		if(Chess.isRegularMove(this._piece.type, this._fromCoords, this._toCoords) && this._isUnobstructed) {
			this._isValid = true;
			this._positionAfter.setPiece(this._from, null);
			this._positionAfter.setPiece(this._to, this._positionBefore.getSquare(this._from));
			this._label.piece = this._piece.fenType;
			this._label.to = Chess.algebraicFromSquare(this._to);

			if(this._piece.type !== PieceType.king) {
				this._label.disambiguation = this._getDisambiguationString();
			}

			if(this._targetPiece !== null && this._targetPiece.colour === this._colour.opposite) {
				this._label.sign = MoveLabel.SIGN_CAPTURE;
				this._capturedPiece = this._positionBefore.getSquare(this._to);
			}
		}
	}

	Move.prototype._checkPawnMove = function() {
		if(this._piece.type === PieceType.pawn && this._isUnobstructed) {
			var isCapturing = Board.isPawnCapture(this._relFrom, this._relTo);
			var isEnPassant = false;
			var isDouble = false;
			var isPromotion = false;
			var isValidPromotion = false;

			if(Chess.isPawnPromotion(this._relTo)) {
				isPromotion = true;

				if([PieceType.knight, PieceType.bishop, PieceType.rook, PieceType.queen].indexOf(this._promoteTo) !== -1) {
					isValidPromotion = true;
				}
			}

			if(isValidPromotion || !isPromotion) {
				if(this._targetPiece.type === null) {
					if(Board.isDoublePawnMove(this._relFrom, this._relTo)) {
						this._isValid = true;
						isDouble = true;
					}

					else if(Board.isPawnMove(this._relFrom, this._relTo)) {
						this._isValid = true;
					}

					else if(isCapturing && this._to === this._positionBefore.epTarget) {
						this._isValid = true;
						isEnPassant = true;
					}
				}

				else if(isCapturing) {
					this._isValid = true;
				}
			}

			if(this._isValid) {
				this._isPromotion = isPromotion;
				
				if(isCapturing) {
					this._label.disambiguation = this._from.file;
					this._label.sign = MoveLabel.SIGN_CAPTURE;

					if(isEnPassant) {
						this._positionAfter.setPiece(Chess.getEpPawn(this._from, this._to), null);
						this._capturedPiece = Piece.getPiece(PieceType.pawn, this._colour.opposite);
					}

					else {
						this._capturedPiece = this._positionBefore.getSquare(this._to);
					}
				}

				if(isDouble) {
					this._positionAfter.setEpTarget(/*FIXME*/Chess.getRelativeSquare(this._relTo - 8, this._colour));
				}

				this._label.to = this._to.algebraic;
				this._positionAfter.setPiece(this._from, null);

				if(isPromotion) {
					this._positionAfter.setPiece(this._to, Piece.get(promoteTo, this._colour));
					this._label.special = MoveLabel.SIGN_PROMOTE + promoteTo.fenStrings[Colour.white];
				}

				else {
					this._positionAfter.setSqsetPieceuare(this._to, this._positionBefore.getPiece(this._from));
				}
			}
		}
	}

	Move.prototype._checkKingMove = function() {
		this._checkRegularMove();

		if(!this._isValid) {
			this._checkCastlingMove();
		}
	}

	Move.prototype._checkCastlingMove = function() {
		if(this._piece.type === PieceType.king && this._isUnobstructed && !this._positionBefore.playerIsInCheck(this._colour)) {
			var castling = new CastlingDetails(this._from, this._to);

			if(castling.isValid && this._positionBefore.getCastlingRightsBySide(this._colour, castling.side)) {
				var throughCheck = false;
				var between = Chess.getSquaresBetween(this._from, this._to);

				for(var i = 0; i < between.length; i++) {
					if(this._positionBefore.getAllAttackers(between[i], this._colour.opposite).length > 0) {
						throughCheck = true;

						break;
					}
				}

				if(!this._positionBefore.moveIsBlocked(this._from, castling.rookStartPos) && !throughCheck) {
					this._isValid = true;
					this._isCastling = true;
					this._label.special = castling.sign;
					this._positionAfter.setPiece(this._from, null);
					this._positionAfter.setPiece(this._to, Piece.getPiece(PieceType.king, this._colour));
					this._positionAfter.setPiece(castling.rookStartPos, null);
					this._positionAfter.setPiece(castling.rookEndPos, Piece.getPiece(Piece.types.ROOK, this._colour));
				}
			}
		}
	}

	Move.prototype._checkForCheck = function() {
		if(!this._hasCheckedForCheck) {
			this._isCheck = (this.isLegal() && this._positionAfter.playerIsInCheck(this._colour.opposite));

			if(this._isCheck) {
				this._label.check = MoveLabel.SIGN_CHECK;
			}

			this._hasCheckedForCheck = true;
		}
	}

	Move.prototype._checkForMate = function() {
		if(!this._hasCheckedForMate) {
			this._isMate = (this.isLegal() && this.isCheck() && this._positionAfter.countLegalMoves(this._colour.opposite) === 0);

			if(this._isMate) {
				this._label.check = MoveLabel.SIGN_MATE;
			}

			this._hasCheckedForMate = true;
		}
	}

	Move.prototype._getDisambiguationString = function() {
		var disambiguationString = "";
		var piecesInRange = this._positionBefore.getAttackers(this._piece.type, this._to, this._colour);

		var disambiguation = {
			file: "",
			rank: ""
		};

		var square;

		for(var i = 0; i < piecesInRange.length; i++) {
			square = piecesInRange[i];

			if(square !== this._from) {
				if(square.file === this._from.file) {
					disambiguation.file = this._from.file;
				}

				if(square.rank === this._from.rank) {
					disambiguation.rank = this._from.rank;
				}
			}
		}

		disambiguationString = disambiguation.file + disambiguation.rank;

		if(piecesInRange.length > 1 && disambiguationString === "") {
			disambiguationString = this._from.file;
		}

		return disambiguationString;
	}

	Move.prototype.getPositionAfter = function() {
		return this._positionAfter.getCopy();
	}
	
	Move.prototype.getTime = function() {
		return this._time;
	}

	Move.prototype.isCheck = function() {
		this._checkForCheck();

		return this._isCheck;
	}

	Move.prototype.isMate = function() {
		this._checkForMate();

		return this._isMate;
	}

	Move.prototype.isCastling = function() {
		return this._isCastling;
	}
	
	Move.prototype.isPromotion = function() {
		return this._isPromotion;
	}

	Move.prototype.isLegal = function() {
		return this._isLegal;
	}

	Move.prototype.getFullmove = function() {
		return this._positionBefore.getFullmove();
	}

	Move.prototype.getColour = function() {
		return this._colour;
	}

	Move.prototype.getLabel = function() {
		this._checkForCheck();
		this._checkForMate();

		return this._label;
	}

	Move.prototype.getFullLabel = function() {
		var dots = (this._colour === Colour.white ? "." : "...");
		
		return this.getFullmove() + dots + " " + this.getLabel();
	}
	
	Move.prototype.getCapturedPiece = function() {
		return this._capturedPiece;
	}

	return Move;
});