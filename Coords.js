define(function(require) {
	function Coords(x, y) {
		this.x = x;
		this.y = y;
		this.isOnBoard = (x > -1 && x < 8 && y > -1 && y < 8);
	}
	
	Coords.prototype.add = function(x, y) {
		return new Coords(this.x + x, this.y + y);
	}
	
	return Coords;
});