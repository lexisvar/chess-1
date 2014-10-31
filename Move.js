define(function(require) {
	var time = require("js/time");
	var Colour = require("./Colour");
	var PieceType = require("./PieceType");
	var Piece = require("./Piece");
	var Square = require("./Square");
	
	var signs = {
		CASTLE_KINGSIDE: "O-O",
		CASTLE_QUEENSIDE: "O-O-O",
		CAPTURE: "x",
		CHECK: "+",
		MATE: "#",
		PROMOTION: "=",
		BUGHOUSE_DROP: "@"
	};

	function Move(position, from, to, promoteTo) {
		this.positionBefore = position.getCopy();
		this.positionAfter = position.getCopy();
		this.from = from;
		this.to = to;
		this.promoteTo = promoteTo || PieceType.queen;
		this.time = time();

		this._targetPiece = this.position.board[this.to.squareNo];
		this.piece = this.position.board[this.from.squareNo];
		this.capturedPiece = null;

		this.colour = this.position.activeColour;
		this.fullmove = position.fullmove;
		this._fromRelative = this.from.adjusted[this.colour];
		this._toRelative = this.to.adjusted[this.colour];

		this._label = {
			piece: "",
			disambiguation: "",
			sign: "",
			to: "",
			special: "",
			check: "",
			notes: ""
		};
		
		this.uciLabel = "";
		
		this.isCastling = false;
		this.castlingRookOrigin = null;
		this.castlingRookDestination = null;
		this.isPromotion = false;
		this.isEnPassant = false;

		this._isUnobstructed = (
			!this.position.moveIsBlocked(this.from, this.to)
			&& (this._targetPiece === null || this._targetPiece.colour === this.colour.opposite)
		);

		this._isValid = false;
		this.isLegal = false;

		this.isCheck = null;
		this.isMate = null;
		this._hasCheckedForCheck = false;
		this._hasCheckedForMate = false;

		this._check();
	}

	Move.prototype.getLabel = function() {
		this.checkCheckAndMate();

		return ""
			+ this._label.piece
			+ this._label.disambiguation
			+ this._label.sign
			+ this._label.to
			+ this._label.special
			+ this._label.check
			+ this._label.notes;
	}
	
	Move.prototype.checkCheckAndMate = function() {
		this._checkCheck();
		this._checkMate();
	}

	Move.prototype.getFullLabel = function() {
		return this.fullmove + (this.colour === Colour.white ? "." : "...") + " " + this.getLabel();
	}

	Move.prototype._check = function() {
		if(this.piece !== null && this.piece.colour === this.colour && this._isUnobstructed) {
			if(this.piece.type === PieceType.pawn) {
				this._checkPawnMove();
			}

			else if(this.piece.type === PieceType.king) {
				this._checkKingMove();
			}

			else {
				this._checkRegularMove();
			}

			this.isLegal = (this._isValid && !this.position.playerIsInCheck(this.colour));

			if(this.isLegal) {
				if(this.colour === Colour.black) {
					this.positionAfter.fullmove++;
				}

				this.positionAfter.activeColour = this.colour.opposite;

				if(this.capturedPiece !== null || this.piece.type === PieceType.pawn) {
					this.positionAfter.fiftyMoveClock = 0;
				}

				else {
					this.positionAfter.fiftymoveClock++;
				}

				if(this.piece.type !== PieceType.pawn || !this._isDoublePawnShape()) {
					this.positionAfter.epTarget = null;
				}

				if(this.piece.type === PieceType.king || this.isCastling) {
					this.positionAfter.setCastlingRights(this.colour, PieceType.king, false);
					this.positionAfter.setCastlingRights(this.colour, PieceType.queen, false);
				}

				else if(this.piece.type === PieceType.rook) {
					if(
						(this.from.file === "a" || this.from.file === "h")
						&& this.from.adjusted[this.colour].x === 0
					) {
						var side = (this.from.file === "a" ? PieceType.queen : PieceType.king);
						
						this.positionAfter.setCastlingRights(this.colour, side, false);
					}
				}
				
				this.uciLabel = this.from.algebraic + this.to.algebraic + (this.isPromotion ? this.promoteTo.sanString.toLowerCase() : "");
			}
		}
	}

	Move.prototype._checkRegularMove = function() {
		if(this._isRegularShape()) {
			this._isValid = true;
			this.position.setPiece(this.from, null);
			this.position.setPiece(this.to, this.position.board[this.from.squareNo]);
			this._label.piece = this.piece.type.sanString;
			this._label.to = this.to.algebraic;

			if(this.piece.type !== PieceType.king) {
				this._label.disambiguation = this._getDisambiguationString();
			}

			if(this._targetPiece !== null && this._targetPiece.colour === this.colour.opposite) {
				this._label.sign = signs.CAPTURE;
				this.capturedPiece = this._targetPiece;
			}
		}
	}
	
	Move.prototype._isRegularShape = function() {
		var diff = {
			x: Math.abs(this.from.coords.x - this.to.coords.x),
			y: Math.abs(this.from.coords.y - this.to.coords.y)
		};

		if(diff.x === 0 && diff.y === 0) {
			return false;
		}

		switch(this.piece.type) {
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
		var isCapturing = this._isPawnCaptureShape();
		var isEnPassant = false;
		var isDouble = false;
		var isPromotion = false;
		var isValidPromotion = false;

		if(this.to.isPromotionRank) {
			isPromotion = true;
			isValidPromotion = this.promoteTo.isValidPromotion;
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

				else if(isCapturing && this.to === this.position.epTarget) {
					this._isValid = true;
					
					isEnPassant = true;
				}
			}

			else if(isCapturing) {
				this._isValid = true;
			}
		}

		if(this._isValid) {
			this.isPromotion = isPromotion;
			this.isEnPassant = isEnPassant;
			
			if(isCapturing) {
				this._label.disambiguation = this.from.file;
				this._label.sign = signs.CAPTURE;

				if(isEnPassant) {
					this.positionAfter.setPiece(Position.getEpPawn(this.from, this.to), null);
					this.capturedPiece = Piece.pieces[PieceType.pawn][this.colour.opposite];
				}

				else {
					this.capturedPiece = this.position.board[this.to.squareNo];
				}
			}

			if(isDouble) {
				this.position.epTarget = Position.getEpTarget(this.from, this.to);
			}

			this._label.to = this.to.algebraic;
			this.position.setPiece(this.from, null);

			if(isPromotion) {
				this.position.setPiece(this.to, Piece.pieces[this.promoteTo][this.colour]);
				this._label.special = signs.PROMOTION + this.promoteTo.sanString;
			}

			else {
				this.position.setPiece(this.to, this.position.board[this.from.squareNo]);
			}
		}
	}
	
	Move.prototype._isPawnShape = function() {
		return (
			this._toRelative.coords.y - this._fromRelative.coords.y === 1
			&& this.to.coords.x === this.from.coords.x
		);
	}
	
	Move.prototype._isPawnCaptureShape = function() {
		return (
			this._toRelative.coords.y - this._fromRelative.coords.y === 1
			&& Math.abs(this.to.coords.x - this.from.coords.x) === 1
		);
	}
	
	Move.prototype._isDoublePawnShape = function() {
		return (
			this._fromRelative.coords.y === 1
			&& this._toRelative.coords.y === 3
			&& this.to.coords.x === this.from.coords.x
		);
	}

	Move.prototype._checkKingMove = function() {
		this._checkRegularMove();

		if(!this._isValid) {
			this._checkCastlingMove();
		}
	}

	Move.prototype._checkCastlingMove = function() {
		var file = (this.to.squareNo < this.from.squareNo ? "a" : "h");
		var homeRankY = (this.colour === Colour.white ? 0 : 7);
		var rookOriginX = (file === "a" ? 0 : 7);
		var rookDestinationX = (file === "a" ? 3 : 5);
		var rookOrigin = Square.byCoords[rookOriginX][this.from.coords.y];
		var rookDestination = Square.byCoords[rookDestinationX][this.from.coords.y];
		
		if(
			Math.abs(this.to.coords.x - this.from.coords.x) === 2
			&& this.from.coords.y === homeRankY
			&& this.to.coords.y === homeRankY
			&& !this.positionBefore.moveIsBlocked(this.from, rookOrigin)
			&& this.positionBefore.getCastlingRights(this.colour, file)
			&& this.positionBefore.board[rookOrigin.squareNo] === Piece.pieces[PieceType.rook][this.colour]
			&& !this.positionBefore.playerIsInCheck(this.colour)
			&& this.positionBefore.getAllAttackers(rookDestination, this.colour.opposite).length === 0
		) {
			this._isValid = true;
			this.isCastling = true;
			this.castlingRookOrigin = rookOrigin,
			this.castlingRookDestination = rookDestination;
			this._label.special = (file === "a" ? signs.CASTLE_QUEENSIDE : signs.CASTLE_KINGSIDE);
			this.positionAfter.setPiece(this.from, null);
			this.positionAfter.setPiece(this.to, Piece.pieces[PieceType.king][this.colour]);
			this.positionAfter.setPiece(rookOrigin, null);
			this.positionAfter.setPiece(rookDestination, Piece.pieces[PieceType.rook][this.colour]);
		}
	}

	Move.prototype._checkCheck = function() {
		if(!this._hasCheckedForCheck) {
			this.isCheck = (this.isLegal && this.positionAfter.playerIsInCheck(this.colour.opposite));

			if(this.isCheck) {
				this._label.check = signs.CHECK;
			}

			this._hasCheckedForCheck = true;
		}
	}

	Move.prototype._checkMate = function() {
		this._checkCheck();
		
		if(!this._hasCheckedForMate) {
			this.isMate = (this.isLegal && this.isCheck && this.positionAfter.countLegalMoves() === 0);

			if(this.isMate) {
				this._label.check = signs.MATE;
			}

			this._hasCheckedForMate = true;
		}
	}

	Move.prototype._getDisambiguationString = function() {
		var disambiguationString = "";
		var piecesInRange = this.positionBefore.getAttackers(this.piece.type, this.to, this.colour);

		var disambiguation = {
			file: "",
			rank: ""
		};

		var square;

		for(var i = 0; i < piecesInRange.length; i++) {
			square = piecesInRange[i];

			if(square !== this.from) {
				if(square.file === this.from.file) {
					disambiguation.rank = this.from.rank;
				}

				if(square.rank === this.from.rank) {
					disambiguation.file = this.from.file;
				}
			}
		}

		disambiguationString = disambiguation.file + disambiguation.rank;

		if(piecesInRange.length > 1 && disambiguationString === "") {
			disambiguationString = this.from.file;
		}

		return disambiguationString;
	}

	return Move;
});