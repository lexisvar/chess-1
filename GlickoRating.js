define(function(require) {
	function GlickoRating() {
		this._rating = 1500;
	}
	
	GlickoRating.prototype.setRating = function(rating) {
		this._rating = rating;
	}
	
	GlickoRating.prototype.updateRating = function(score, opponentGlickoRating) {
		
	}
	
	GlickoRating.prototype.getRating = function() {
		return this._rating;
	}
	
	return GlickoRating;
});