define(function(require) {
	var Piece = require("./Piece");
	var PieceType = require("./PieceType");
	var Square = require("./Square");
	var Colour = require("./Colour");

	function Board() {
		this._board = [];

		for(var i = 0; i < 64; i++) {
			this._board.push(null);
		}

		this._kingPositions = [];
		this._kingPositions[Colour.white] = null;
		this._kingPositions[Colour.black] = null;
	}

	Board.prototype.move = function(from, to) {
		this.setPiece(to, this.getPiece(from));
		this.setPiece(from, null);
	}

	Board.prototype.setPiece = function(square, piece) {
		this._board[square.squareNo] = piece;

		if(piece.type === PieceType.king) {
			this._kingPositions[piece.colour] = square;
		}
	}

	Board.prototype.getPiece = function(square) {
		return this._board[square.squareNo];
	}
	
	Board.prototype.getKingPosition = function(colour) {
		return this._kingPositions[colour];
	}

	Board.prototype.setBoardArray = function(board) {
		Square.forEach((function(square) {
			this.setPiece(square, board[square.squareNo]);
		}).bind(this));
	}

	Board.prototype.getBoardArray = function() {
		return this._board;
	}

	Board.prototype.getCopy = function(board) {
		var board = new Board();

		board.setBoardArray(this.getBoardArray());

		return board;
	}
	
	/*
	Square.prototype.isBishopMoveFrom = function(square) {
		
	}
	
	Square.prototype.isRookMoveFrom = function(square) {
		
	}
	
	Square.prototype.isPromotionRank = function() {
		
	}
	
	Square.prototype.getReachableSquares = function(piece) {
		
		TODO
		
		use better Piece object interface here once it's done
		
	}
	
	Square.prototype._generateReachableSquares = function() {
		this.reachableSquares = {};
		
		Piece.forEachType((function(pieceType) {
			this.reachableSquares[pieceType] = {};
			
			Colour.forEach((function(colour) {
				this.reachableSquares[pieceType][colour] = [];
			}).bind(this));
		}).bind(this));
		
		Colour.forEach((function() {
			case Piece.PAWN: {
					var relFrom = Chess.getRelativeSquare(from, colour);

					if(relFrom < 16) {
						squares.push(Chess.getRelativeSquare(relFrom + 16, colour));
					}

					var relCoords = Chess.coordsFromSquare(relFrom);
					var x, y;

					for(var xDiff = -1; xDiff < 2; xDiff++) {
						x = relCoords.x + xDiff;
						y = relCoords.y + 1;

						if(x > -1 && x < 8 && y > -1 && y < 8) {
							squares.push(Chess.getRelativeSquare(Chess.squareFromCoords({
								x: x,
								y: y
							}), colour));
						}
					}

					break;
			this.reachableSquares[Piece.types.KNIGHT][colour].push();
		}).bind(this));
		
		
		
	}
	
	_between: function(squareA, squareB, inclusive) {
			var squares = [];

			var lower = Math.min(squareA.squareNo, squareB.squareNo);
			var upper = Math.max(squareA.squareNo, squareB.squareNo);

			squareA = Squares.fromSquareNo(lower);
			squareB = Squares.fromSquareNo(upper);

			var difference = squareB.squareNo - squareA.squareNo;
			var distanceInSquares = 0;
			var increment;

			if(squareA.isBishopMoveFrom(squareB)) {
				distanceInSquares = Math.abs(squareA.coords.x - squareB.coords.x);
			}

			else if(squareA.isRookMoveFrom(squareB)) {
				distanceInSquares = (difference > 7 ? difference / 8 : difference);
			}

			if(distanceInSquares > 0) {
				increment = difference / distanceInSquares;
				
				for(var squareNo = squareA.squareNo + increment; squareNo < squareB.squareNo; squareNo += increment) {
					squares.push(Squares.fromSquareNo(squareNo));
				}
				
				if(inclusive) {
					squares.push(squareA);
					squares.push(squareB);
				}
			}
			
			return squares;
		},
		
		between: function(squareA, squareB) {
			return Squares._between(squareA, squareB, false);
		},
		
		betweenInclusive: function(squareA, squareB) {
			return Squares._between(squareA, squareB, true);
		},
		
		getEpTarget: function(capturerFrom, capturerTo) {
			return Squares.fromCoords({
				x: capturerTo.coords.x,
				y: capturerFrom.coords.y
			});
		},
		
		getKingHomeSquare: function(colour) {
			var homeSquares = {};
			
			homeSquares[Fen.WHITE] = 4;
			homeSquares[Fen.BLACK] = 60;
			
			return Squares.fromSquareNo(homeSquares[colour.fenString]);
		}
	*/
	
	/*

		getReachableSquares: function(type, from, colour) {
			var fromCoords = Chess.coordsFromSquare(from);
			var squares = [];

			switch(type) {
				
				}

				case Piece.KNIGHT: {
					var xDiffs = [-1, -1, 1, 1, -2, -2, 2, 2];
					var yDiffs = [-2, 2, -2, 2, 1, -1, 1, -1];
					var x, y;

					for(var i = 0; i < 8; i++) {
						x = fromCoords.x + xDiffs[i];
						y = fromCoords.y + yDiffs[i];

						if(x > -1 && x < 8 && y > -1 && y < 8) {
							squares.push(Chess.squareFromCoords({
								x: x,
								y: y
							}));
						}
					}

					break;
				}

				case Piece.BISHOP: {
					var diffs = [1, -1];
					var coords;

					for(var ix = 0; ix < diffs.length; ix++) {
						for(var iy = 0; iy < diffs.length; iy++) {
							coords = {
								x: fromCoords.x,
								y: fromCoords.y
							};

							while(true) {
								coords.x += diffs[ix];
								coords.y += diffs[iy];

								if(coords.x > -1 && coords.x < 8 && coords.y > -1 && coords.y < 8) {
									squares.push(Chess.squareFromCoords(coords));
								}

								else {
									break;
								}
							}
						}
					}

					break;
				}

				case Piece.ROOK: {
					var squareOnSameRank, squareOnSameFile;

					for(var n = 0; n < 8; n++) {
						squareOnSameRank = (fromCoords.y * 8) + n;
						squareOnSameFile = fromCoords.x + (n * 8);

						if(squareOnSameRank !== from) {
							squares.push(squareOnSameRank);
						}

						if(squareOnSameFile !== from) {
							squares.push(squareOnSameFile);
						}
					}

					break;
				}

				case Piece.QUEEN: {
					var rookSquares = Chess.getReachableSquares(Piece.ROOK, from, colour);
					var bishopSquares = Chess.getReachableSquares(Piece.BISHOP, from, colour);

					squares = rookSquares.concat(bishopSquares);

					break;
				}

				case Piece.KING: {
					var x, y;

					for(var xDiff = -1; xDiff < 2; xDiff++) {
						x = fromCoords.x + xDiff;

						if(x > -1 && x < 8) {
							for(var yDiff = -1; yDiff < 2; yDiff++) {
								y = fromCoords.y + yDiff;

								if(y > -1 && y < 8) {
									squares.push(Chess.squareFromCoords({
										x: x,
										y: y
									}));
								}
							}
						}
					}
					
					var kingHomeSquare = (colour === Colour.black ? 60 : 4);
					var castlingSquares = (colour === Colour.black ? [58, 62] : [2, 6]);

					if(from === kingHomeSquare) {
						squares = squares.concat(castlingSquares);
					}

					break;
				}
			}

			return squares;
		}
	*/
	
	/*
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
			return (relTo - relFrom === 8);
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
	*/

	return Board;
});