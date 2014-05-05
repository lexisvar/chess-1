define(function(require) {
	var time = require("lib/time");
	var Colour = require("./Colour");
	var PieceType = require("./PieceType");
	var Piece = require("./Piece");
	var MoveLabel = require("./MoveLabel");
	var Fen = require("./Fen");
	var Square = require("./Square");
	var Board = require("./Board");
	var Coords = require("./Coords");

	function Move(positionBefore, from, to, promoteTo) {
		this._positionBefore = positionBefore;
		this._from = from;
		this._to = to;
		this._promoteTo = promoteTo || PieceType.queen;
		this._positionAfter = this._positionBefore.getCopy();
		this._time = time();

		this._piece = this._positionBefore.getPiece(this._from);
		this._targetPiece = this._positionBefore.getPiece(this._to);
		this._capturedPiece = null;

		this._colour = this._positionBefore.getActiveColour();
		this._fromRelative = this._from.adjusted[this._colour];
		this._toRelative = this._to.adjusted[this._colour];

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
	
	Move.prototype.getPromoteTo = function() {
		return this._promoteTo;
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

		return this._label.toString();
	}

	Move.prototype.getFullLabel = function() {
		return this.getFullmove() + (this._colour === Colour.white ? "." : "...") + " " + this.getLabel();
	}
	
	Move.prototype.getCapturedPiece = function() {
		return this._capturedPiece;
	}
	
	Move.prototype.getFrom = function() {
		return this._from;
	}
	
	Move.prototype.getTo = function() {
		return this._to;
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

				if(this._piece.type !== PieceType.pawn || !this._isDoublePawnShape()) {
					this._positionAfter.setEpTarget(null);
				}

				if(this._piece.type === PieceType.king || this._isCastling) {
					"abcdefgh".split("").forEach((function(file) {
						this._positionAfter.setCastlingRights(this._colour, file, false);
					}).bind(this));
				}

				else if(this._piece.type === PieceType.rook) {
					this._positionAfter.setCastlingRights(this._colour, this._from.file, false);
				}
			}
		}
	}

	Move.prototype._checkRegularMove = function() {
		if(this._isRegularShape() && this._isUnobstructed) {
			this._isValid = true;
			this._positionAfter.setPiece(this._from, null);
			this._positionAfter.setPiece(this._to, this._positionBefore.getPiece(this._from));
			this._label.piece = this._piece.type.sanString;
			this._label.to = this._to.algebraic;

			if(this._piece.type !== PieceType.king) {
				this._label.disambiguation = this._getDisambiguationString();
			}

			if(this._targetPiece !== null && this._targetPiece.colour === this._colour.opposite) {
				this._label.sign = MoveLabel.SIGN_CAPTURE;
				this._capturedPiece = this._targetPiece;
			}
		}
	}
	
	Move.prototype._isRegularShape = function() {
		var diff = {
			x: Math.abs(this._from.coords.x - this._to.coords.x),
			y: Math.abs(this._from.coords.y - this._to.coords.y)
		};

		if(diff.x === 0 && diff.y === 0) {
			return false;
		}

		switch(this._piece.type) {
			case PieceType.pawn: {
				return false;
			}

			case PieceType.knight: {
				return ((diff.x === 2 && diff.y === 1) || (diff.x === 1 && diff.y === 2));
			}

			case PieceType.bishop: {
				return (diff.x === diff.y);
			}

			case PieceType.rook: {
				return (diff.x === 0 || diff.y === 0);
			}

			case PieceType.queen: {
				return (diff.x === diff.y || (diff.x === 0 || diff.y === 0));
			}

			case PieceType.king: {
				return ((diff.x === 1 || diff.x === 0) && (diff.y === 1 || diff.y === 0));
			}
		}
	}

	Move.prototype._checkPawnMove = function() {
		if(this._piece.type === PieceType.pawn && this._isUnobstructed) {
			var isCapturing = this._isPawnCaptureShape();
			var isEnPassant = false;
			var isDouble = false;
			var isPromotion = false;
			var isValidPromotion = false;

			if(this._to.isPromotionRank) {
				isPromotion = true;
				isValidPromotion = this._promoteTo.isValidPromotion;
			}

			if(isValidPromotion || !isPromotion) {
				if(this._targetPiece === null) {
					if(this._isDoublePawnShape()) {
						this._isValid = true;
						
						isDouble = true;
					}

					else if(this._isPawnShape()) {
						this._isValid = true;
					}

					else if(isCapturing && this._to === this._positionBefore.getEpTarget()) {
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
						this._positionAfter.setPiece(Board.getEpPawn(this._from, this._to), null);
						this._capturedPiece = Piece.get(PieceType.pawn, this._colour.opposite);
					}

					else {
						this._capturedPiece = this._positionBefore.getPiece(this._to);
					}
				}

				if(isDouble) {
					this._positionAfter.setEpTarget(Board.getEpTarget(this._from, this._to));
				}

				this._label.to = this._to.algebraic;
				this._positionAfter.setPiece(this._from, null);

				if(isPromotion) {
					this._positionAfter.setPiece(this._to, Piece.get(this._promoteTo, this._colour));
					this._label.special = MoveLabel.SIGN_PROMOTE + this._promoteTo.sanString;
				}

				else {
					this._positionAfter.setPiece(this._to, this._positionBefore.getPiece(this._from));
				}
			}
		}
	}
	
	Move.prototype._isPawnShape = function() {
		return (
			this._toRelative.coords.y - this._fromRelative.coords.y === 1
			&& this._to.coords.x === this._from.coords.x
		);
	}
	
	Move.prototype._isPawnCaptureShape = function() {
		return (
			this._toRelative.coords.y - this._fromRelative.coords.y === 1
			&& Math.abs(this._to.coords.x - this._from.coords.x) === 1
		);
	}
	
	Move.prototype._isDoublePawnShape = function() {
		return (
			this._fromRelative.coords.y === 1
			&& this._toRelative.coords.y === 3
			&& this._to.coords.x === this._from.coords.x
		);
	}

	Move.prototype._checkKingMove = function() {
		this._checkRegularMove();

		if(!this._isValid) {
			this._checkCastlingMove();
		}
	}

	Move.prototype._checkCastlingMove = function() {
		var file = (this._to.squareNo < this._from.squareNo ? "a" : "h");
		var rookOriginX = (file === "a" ? 0 : 7);
		var rookDestinationX = (file === "a" ? 3 : 5);
		var rookOrigin = Square.fromCoords(new Coords(rookOriginX, this._from.coords.y));
		var rookDestination = Square.fromCoords(new Coords(rookDestinationX, this._from.coords.y));
		
		if(
			this._piece.type === PieceType.king
			&& Math.abs(this._to.coords.x - this._from.coords.x) === 2
			&& !this._positionBefore.moveIsBlocked(this._from, rookOrigin)
			&& this._positionBefore.getCastlingRights(this._colour, file)
			&& this._positionBefore.getPiece(rookOrigin) === Piece.get(PieceType.rook, this._colour)
			&& !this._positionBefore.playerIsInCheck(this._colour)
			&& this._positionBefore.getAllAttackers(rookDestination, this._colour.opposite).length === 0
		) {
			this._isValid = true;
			this._isCastling = true;
			this._label.special = (file === "a" ? MoveLabel.SIGN_CASTLE_QS : MoveLabel.SIGN_CASTLE_KS);
			this._positionAfter.setPiece(this._from, null);
			this._positionAfter.setPiece(this._to, Piece.get(PieceType.king, this._colour));
			this._positionAfter.setPiece(rookOrigin, null);
			this._positionAfter.setPiece(rookDestination, Piece.get(PieceType.rook, this._colour));
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

	return Move;
});