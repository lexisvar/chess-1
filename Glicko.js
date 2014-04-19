define(function(require) {
	return {
		INITIAL_RATING: 1500,
		
		getNewRatings: function(oldRatings, result) {
			/*
			Glicko
			
			FIXME
			
			return {
				w: 1234,
				b: 1634
			};
			*/
			
			return {
				"w": 1500,
				"b": 1500
			};
		}
	};
});