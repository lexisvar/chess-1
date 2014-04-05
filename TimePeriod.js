define(function(require) {
	var Tokeniser = require("lib/Tokeniser");
	
	var MILLISECONDS = 1000;
	
	var unitMultipliers = {
		"s": 1,
		"m": 60,
		"h": 3600,
		"d": 86400,
		"w": 604800,
		"y": 31449600
	};

	return {
		parse: function(timeString, defaultUnits) {
			var timeInSeconds = 0;
			var unitsRegex = /[smhdwy]/i;
			var timeRegex = /\d/;
			var unitValues = {};
			var tokeniser = new Tokeniser(timeString);
			var time, units;
			
			while(!tokeniser.isEof()) {
				tokeniser.skipUntilMatches(timeRegex);
				time = parseInt(tokeniser.readWhileMatches(timeRegex) || "0");
				
				tokeniser.skipUntilMatches(unitsRegex);
				units = tokeniser.readWhileMatches(unitsRegex).charAt(0).toLowerCase() || defaultUnits;
				
				unitValues[units] = time;
			}
			
			for(var units in unitValues) {
				if(units in unitMultipliers) {
					timeInSeconds += unitValues[units] * unitMultipliers[units];
				}
			}
			
			return timeInSeconds;
		},

		encode: function(timeInSeconds, defaultUnits) {
			var remaining = timeInSeconds;
			var divisor, quantity;

			return "ywdhms".split("").map(function(units) {
				var string = "";
				
				divisor = unitMultipliers[units];

				if(remaining >= divisor) {
					quantity = Math.floor(remaining / divisor);
					remaining = remaining % divisor;
					string += quantity;
					
					if(units !== defaultUnits || remaining > 0) {
						string += units;
					}
				}
				
				return string;
			}).join("") || "0";
		},
		
		getColonDisplay: function(timeInMilliseconds, displayTenths) {
			var timeInSeconds = Math.floor(timeInMilliseconds / MILLISECONDS);
			var tenths = Math.floor((timeInMilliseconds % MILLISECONDS) / (MILLISECONDS / 10));
			var remaining = timeInSeconds;
			var remainder;
			var divisor;
			var minParts = 2;
			var parts = [];
			var haveNonZeroParts = false;
			var quantity, quantityString;
	
			"dhms".split("").forEach(function(units, i, partMultipliers) {
				divisor = unitMultipliers[units];
				remainder = remaining % divisor;
				quantity = (remaining - remainder) / divisor;
				quantityString = "" + quantity;
	
				if(quantity > 0 || haveNonZeroParts || i >= partMultipliers.length - minParts) {
					if(parts.length > 0 && quantity < 10) {
						quantityString = "0" + quantityString;
					}
					
					parts.push(quantityString);
				}
	
				remaining = remainder;
	
				if(quantity > 0) {
					haveNonZeroParts = true;
				}
			});
	
			var display = parts.join(":");
	
			if(displayTenths) {
				display += "." + tenths;
			}
	
			return display;
		}
	};
});