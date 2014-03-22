define(function(require) {
	var Colour = require("./Colour");
	
	function Square(squareNo, coordsX, coordsY, algebraic) {
		this.algebraic = algebraic;
		this.squareNo = squareNo;
		
		this.coords = {
			x: coordsX,
			y: coordsY
		};
		
		this.file = files.charAt(coordsX);
		this.rank = ranks.charAt(coordsY);
		
		/*
		TODO
		
		generate map of reachable squares
		*/
	}
	
	Square.prototype.isBishopMoveFrom = function(square) {
		
	}
	
	Square.prototype.isRookMoveFrom = function(square) {
		
	}
	
	Square.prototype.getReachableSquares = function(piece) {
		/*
		TODO
		
		use better Piece object interface here once it's done
		*/
	}
	
	var files = "abcdefgh";
	var ranks = "12345678";
	var squares = [];
	var squaresByAlgebraic = [];
	var squaresByCoords = [];
	
	var square, squareNo, algebraic;
	
	for(var x = 0; x < 8; x++) {
		squaresByCoords[x] = [];
		
		for(var y = 0; y < 8; y++) {
			squareNo = y * 8 + x;
			algebraicSquare = files.charAt(x) + ranks.charAt(y);
			square = new Square(squareNo);
			
			squares[squareNo] = square;
			squaresByCoords[x][y] = square;
			squaresByAlgebraic[algebraic] = square;
		}
	}
	
	var Squares = {
		fromRelativeSquareNo: function(squareNo, viewedAs) {
			return squares[viewedAs === Colour.BLACK ? 63 - squareNo : squareNo];
		},
		
		fromSquareNo: function(squareNo) {
			return squares[squareNo];
		},
		
		fromAlgebraic: function(algebraic) {
			return squaresByAlgebraic[algebraic];
		},
		
		fromCoords: function(coords) {
			return squaresByCoords[coords.x][coords.y];
		},
		
		forEach: function(callback) {
			squares.forEach(callback);
		},
		
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
		}
	};
	
	/*

		getReachableSquares: function(type, from, colour) {
			var fromCoords = Chess.coordsFromSquare(from);
			var squares = [];

			switch(type) {
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
					
					var kingHomeSquare = (colour === Piece.BLACK ? 60 : 4);
					var castlingSquares = (colour === Piece.BLACK ? [58, 62] : [2, 6]);

					if(from === kingHomeSquare) {
						squares = squares.concat(castlingSquares);
					}

					break;
				}
			}

			return squares;
		}
	*/
	
	return Squares;
});