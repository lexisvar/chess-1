define(function(require) {
	var Tokeniser = require("lib/Tokeniser");
	
	var MILLISECONDS_PER_SECOND = 1000;
	
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
			var remaining = time;
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
		
		getColonDisplay: function(time, displayTenths) {
			var parts = [];
			var time = Math.floor(time / MSEC_PER_SEC);
			var tenths = Math.floor((time % MSEC_PER_SEC) / (MSEC_PER_SEC / 10));
			var remaining = time;
			var remainder;
			var divisor;
			var onFirstPart = true;
			var haveNonZeroParts = false;
			var display;
			var partMultiples = [24, 60, 60, 1];
			var n, str;
	
			var minParts = 2;  // at least 0:12 if there are only 12 seconds left, but not 0:00:12
			var minDigits = 2;
	
			for(var i = 0; i < partMultiples.length; i++) {
				divisor = partMultiples[i];
	
				for(var j = i + 1; j < partMultiples.length; j++) {
					divisor *= partMultiples[j];
				}
	
				remainder = remaining % divisor;
				n = (remaining - remainder) / divisor;
				str = "" + n;
	
				if(!onFirstPart) {
					while(str.length < minDigits) {
						str = "0" + str;
					}
				}
	
				if(n > 0 || haveNonZeroParts || i >= partMultiples.length - minParts) {
					parts.push(str);
					onFirstPart = false;
				}
	
				remaining = remainder;
	
				if(n > 0) {
					haveNonZeroParts = true;
				}
			}
	
			display = parts.join(":");
	
			if(displayTenths) {
				display += "." + tenths;
			}
	
			return display;
		}
	};
});