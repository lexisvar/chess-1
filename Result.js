define(function(require) {
	var Colour = require("./Colour");
	
	function Result(result, type) {
		this.winner = null;
		this.isDraw = true;
		this.scores = {};
		this.type = type;
		this.description = Result.descriptions[this.type];
		
		if(result === Result.DRAW) {
			this.summary = "\u00bd-\u00bd";
			this.scores[Colour.white] = 0.5;
			this.scores[Colour.black] = 0.5;
		}
		
		else {
			this.winner = result;
			this.isDraw = false;
			this.scores[this.winner] = 1;
			this.scores[this.winner.opposite] = 0;
			this.summary = this.scores[Colour.white] + "-" + this.scores[Colour.black];
			
			var replacements = {
				"winner": this.winner.name,
				"loser": this.winner.opposite.name
			};
			
			for(var placeholder in replacements) {
				this.description = this.description.replace(
					new RegExp("\\[" + placeholder + "\\]", "g"),
					replacements[placeholder]
				);
			}
		}
	}
	
	Result.prototype.toString = function() {
		return this.summary;
	}
	
	Result.DRAW = "draw";
	
	Result.types = {
		CHECKMATE: "checkmate",
		RESIGNATION: "resignation",
		FIFTYMOVE: "fifty move rule",
		THREEFOLD: "threefold",
		TIMEOUT: "timeout",
		INSUFFICIENT: "insufficient material",
		NO_MOVES: "stalemate",
		DRAW_AGREED: "draw agreed"
	};
	
	Result.descriptions = {};
	
	Result.descriptions[Result.types.CHECKMATE] = "[winner] won by checkmate";
	Result.descriptions[Result.types.RESIGNATION] = "[loser] resigned";
	Result.descriptions[Result.types.FIFTYMOVE] = "Fifty move rule";
	Result.descriptions[Result.types.THREEFOLD] = "Threefold repetition";
	Result.descriptions[Result.types.TIMEOUT] = "[loser] forfeit on time";
	Result.descriptions[Result.types.INSUFFICIENT] = "Insufficient mating material";
	Result.descriptions[Result.types.DRAW_AGREED] = "Draw agreed";
	
	return {
		win: function(colour, type, white, black) {
			return new Result(colour, type, white, black);
		},
		
		draw: function(type) {
			return new Result(Result.DRAW, type);
		},
		
		types: Result.types
	};
});