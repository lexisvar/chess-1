define(function(require) {
	var Colour = require("./Colour");
	var Coords = require("./Coords");
	
	var files = "abcdefgh";
	var ranks = "12345678";
	
	function Square(squareNo, coordsX, coordsY, algebraic) {
		this.algebraic = algebraic;
		this.squareNo = squareNo;
		this.coords = new Coords(coordsX, coordsY);
		this.file = files.charAt(coordsX);
		this.rank = ranks.charAt(coordsY);
		this.isPromotionRank = (this.rank === "1" || this.rank === "8");
		this.adjusted = {};
		this.adjusted[Colour.white] = this;
	}
	
	var squares = [];
	var squaresByAlgebraic = {};
	var squaresByCoords = [];
	
	var square, squareNo, algebraic;
	
	for(var x = 0; x < 8; x++) {
		squaresByCoords[x] = [];
		
		for(var y = 0; y < 8; y++) {
			squareNo = y * 8 + x;
			algebraic = files.charAt(x) + ranks.charAt(y);
			square = new Square(squareNo, x, y, algebraic);
			
			squares[squareNo] = square;
			squaresByCoords[x][y] = square;
			squaresByAlgebraic[algebraic] = square;
		}
	}
	
	squares.forEach(function(square) {
		square.adjusted[Colour.black] = squares[63 - square.squareNo];
	});
	
	return {
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