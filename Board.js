define(function(require) {
	var Piece = require("./Piece");
	var PieceType = require("./PieceType");
	var Square = require("./Square");
	var Colour = require("./Colour");
	var Coords = require("./Coords");

	function Board() {
		this._board = [];

		Square.forEach((function(square) {
			this._board[square.squareNo] = null;
		}).bind(this));

		this._kingPositions = {};
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
	
	Board.getEpTarget = function(from, to) {
		return Square.fromSquareNo(to.squareNo - ((to.squareNo - from.squareNo) / 2));
	}
	
	Board.getEpPawn = function(from, to) {
		return Square.fromCoords(new Coords(from.coords.y, to.coords.x));
	}
	
	Board.prototype.getAttackers = function(pieceType, square, colour) {
		if(pieceType === PieceType.pawn) {
			return this.getPawnAttackers(square, colour);
		}

		else if(pieceType === PieceType.king) {
			return this.getKingAttackers(square, colour);
		}

		else {
			return this.getRegularAttackers(pieceType, square, colour);
		}
	}

	Board.prototype.getPawnAttackers = function(square, colour) {
		var attackers = [];
		var piece = Piece.get(PieceType.pawn, colour);
		var candidateSquare;
		var coords;

		for(var x = -1; x <= 1; x += 2) {
			coords = square.adjusted[colour].coords.add(x, -1);
			
			if(coords.isOnBoard) {
				candidateSquare = Square.fromCoords(coords).adjusted[colour];

				if(this._board.getPiece(candidateSquare) === piece) {
					attackers.push(candidateSquare);
				}
			}
		}

		return attackers;
	}

	Board.prototype.getKingAttackers = function(square, colour) {
		var attackers = [];
		var piece = Piece.get(PieceType.king, colour);
		var coords, candidateSquare;

		for(var x = -1; x <= 1; x++) {
			for(var y = -1; y <= 1; y++) {
				coords = square.coords.add(x, y);
				
				if(coords.isOnBoard) {
					candidateSquare = Square.fromCoords(coords);

					if(this._board.getPiece(candidateSquare) === piece && candidateSquare !== square) {
						attackers.push(candidateSquare);
					}
				}
			}
		}

		return attackers;
	}

	Board.prototype.getRegularAttackers = function(pieceType, square, colour) {
		var attackers = [];
		var piece = Piece.get(pieceType, colour);
		var candidateSquares = Board.getReachableSquares(pieceType, square, colour);
		var candidateSquare;

		for(var i = 0; i < candidateSquares.length; i++) {
			candidateSquare = candidateSquares[i];

			if(this._board.getPiece(candidateSquare) === piece && !this._board.moveIsBlocked(square, candidateSquare)) {
				attackers.push(candidateSquare);
			}
		}

		return attackers;
	}

	Board.prototype.getAllAttackers = function(square, colour) {
		var attackers = [];
		
		PieceType.forEach((function(pieceType) {
			attackers = attackers.concat(this.getAttackers(pieceType, square, colour));
		}).bind(this));

		return attackers;
	}
	
	Board.prototype.playerIsInCheck = function(colour) {
		return (this.getAllAttackers(this.getKingPosition(colour), colour.opposite).length > 0);
	}
	
	Board.prototype.playerCanMate = function(colour) {
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
			piece = this._board[square];

			if(piece !== null && piece.type !== PieceType.king) {
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
	

	Board.prototype.moveIsBlocked = function(from, to) {
		var squares = Chess.getSquaressBetween(from, to);

		for(var i = 0; i < squares.length; i++) {
			if(this._board.getPiece(squares[i]) !== null) {
				return true;
			}
		}

		return false;
	}
	
	Board.getSquaresBetween = function(a, b, inclusive) {
		var squares = [];

		var lower = Math.min(a.squareNo, b.squareNo);
		var upper = Math.max(a.squareNo, b.squareNo);

		a = Squares.fromSquareNo(lower);
		b = Squares.fromSquareNo(upper);

		var coordsDifference = {
			x: b.coords.x - a.coords.x,
			y: b.coords.y - a.coords.y
		};
		
		var difference = b.squareNo - a.squareNo;
		var distanceInSquares = 0;
		var increment;

		if(coordsDifference.x === coordsDifference.y) {
			distanceInSquares = coordsDifference.x;
		}

		else if(coordsDifference.x === 0 || coordsDifference.y === 0) {
			distanceInSquares = (difference > 7 ? difference / 8 : difference);
		}

		if(distanceInSquares > 0) {
			increment = difference / distanceInSquares;
			
			for(var squareNo = a.squareNo + increment; squareNo < b.squareNo; squareNo += increment) {
				squares.push(Squares.fromSquareNo(squareNo));
			}
			
			if(inclusive) {
				squares.push(a);
				squares.push(b);
			}
		}
		
		return squares;
	}
	
	Board.getReachableSquares = function(pieceType, from, colour) {
		var squares = [];

		switch(type) {
			case PieceType.pawn: {
				var fromRelative = from.adjusted[colour];

				if(fromRelative.coords.y === 1) {
					squares.push(Square.fromSquareNo(fromRelative.squareNo + 16).adjusted[colour]);
				}
				
				var coords;

				for(var x = -1; x < 2; x++) {
					coords = fromRelative.coords.add(x, fromRelative.coords.y + 1);

					if(coords.isOnBoard) {
						squares.push(Square.fromCoords(coords).adjusted[colour]);
					}
				}

				break;
			}

			case PieceType.knight: {
				var xDiffs = [-1, -1, 1, 1, -2, -2, 2, 2];
				var yDiffs = [-2, 2, -2, 2, 1, -1, 1, -1];
				var coords;

				for(var i = 0; i < 8; i++) {
					coords = from.coords.add(xDiffs[i], yDiffs[i]);

					if(coords.isOnBoard) {
						squares.push(Square.fromCoords(coords));
					}
				}

				break;
			}

			case PieceType.bishop: {
				var directions = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
				var coords;
				
				directions.forEach(function(coordPair) {
					coords = from.coords;
					
					while(true) {
						coords = coords.add(coordPair[0], coordPair[1]);
						
						if(coords.isOnBoard) {
							squares.push(Square.fromCoords(coords));
						}
						
						else {
							break;
						}
					}
				});
				
				break;
			}

			case PieceType.rook: {
				var squareOnSameRank, squareOnSameFile;

				for(var n = 0; n < 8; n++) {
					squareOnSameRank = Square.fromCoords(new Coords(n, from.coords.y));
					squareOnSameFile = Square.fromCoords(new Coords(from.coords.x, n));

					if(squareOnSameRank !== from) {
						squares.push(squareOnSameRank);
					}

					if(squareOnSameFile !== from) {
						squares.push(squareOnSameFile);
					}
				}

				break;
			}

			case PieceType.queen: {
				var rookSquares = Board.getReachableSquares(PieceType.rook, from, colour);
				var bishopSquares = Board.getReachableSquares(PieceType.bishop, from, colour);

				squares = rookSquares.concat(bishopSquares);

				break;
			}

			case PieceType.king: {
				var coords, candidateSquare;
		
				for(var x = -1; x <= 1; x++) {
					for(var y = -1; y <= 1; y++) {
						coords = square.coords.add(x, y);
						
						if(coords.isOnBoard && !coords.equals(from.coords)) {
							squares.push(Square.fromCoords(coords));
						}
					}
				}
				
				var kingHomeSquare = Square.fromAlgebraic(colour === Colour.black ? "e8" : "e1");

				if(from === kingHomeSquare) {
					squares = squares.concat([
						Square.fromCoords(from.coords.x - 2, from.coords.y),
						Square.fromCoords(from.coords.x + 2, from.coords.y)
					]);
				}

				break;
			}
		}

		return squares;
	}

	return Board;
});