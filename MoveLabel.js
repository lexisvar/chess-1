define(function(require) {
	function MoveLabel() {
		this.piece = "";
		this.disambiguation = "";
		this.sign = "";
		this.to = "";
		this.special = "";
		this.check = "";
		this.notes = "";
	}

	MoveLabel.prototype.toString = function() {
		return this.piece + this.disambiguation + this.sign + this.to + this.special + this.check + this.notes;
	}
	
	MoveLabel.signs = {
		CASTLE_KINGSIDE: "O-O",
		CASTLE_QUEENSIDE: "O-O-O",
		CAPTURE: "x",
		CHECK: "+",
		MATE: "#",
		PROMOTION: "=",
		BUGHOUSE_DROP: "@"
	};

	return MoveLabel;
});