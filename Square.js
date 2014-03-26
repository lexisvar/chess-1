define(function(require) {
	var Colour = require("./Colour");
	
	function Square(squareNo, coordsX, coordsY, algebraic) {
		this.algebraic = algebraic;
		this.squareNo = squareNo;
		
		this.coords = {
			x: coordsX,
			y: coordsY
		};
		
		this.file = "abcdefgh".charAt(coordsX);
		this.rank = "12345678".charAt(coordsY);
		
		this.isPromotionRank = (this.rank === "1" || this.rank === "8");
	}
	
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
	
	return {
		fromRelativeSquareNo: function(squareNo, viewedAs) {
			return squares[viewedAs === Colour.black ? 63 - squareNo : squareNo];
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
		}
	};
});