define(function(require) {
	function Colour(fenString) {
		this.fenString = fenString;
		
		this.name = ({
			"w": "white",
			"b": "black"
		})[fenString];
	}
	
	Colour.prototype.toString = function() {
		return this.fenString;
	}
	
	var colours = {
		"w": new Colour("w"),
		"b": new Colour("b")
	};
	
	colours["w"].opposite = colours["b"];
	colours["b"].opposite = colours["w"];

	return {
		white: colours["w"],
		black: colours["b"],
		
		fromFenString: function(fenString) {
			return colours[fenString];
		},
		
		forEach: function(callback) {
			for(var fenString in colours) {
				callback(colours[fenString]);
			}
		}
	};
});