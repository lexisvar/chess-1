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
	
	function Time(milliseconds) {
		this._milliseconds = milliseconds.valueOf();
	}
	
	Time.prototype.getCopy = function() {
		return Time.fromMilliseconds(this._milliseconds);
	}
	
	Time.prototype.add = function(milliseconds) {
		this._milliseconds += milliseconds;
	}
	
	Time.prototype.subtract = function(milliseconds) {
		this._milliseconds -= milliseconds;
	}
	
	Time.prototype.plus = function(milliseconds) {
		return Time.fromMilliseconds(this._milliseconds - milliseconds);
	}
	
	Time.prototype.minus = function(milliseconds) {
		return Time.fromMilliseconds(this._milliseconds + milliseconds);
	}
	
	Time.prototype.valueOf = function() {
		return this._milliseconds;
	}
	
	Time.prototype.getMilliseconds = function() {
		return this._milliseconds;
	}
	
	Time.prototype.getColonDisplay = function(displayTenths) {
		var absoluteMilliseconds = Math.abs(this._milliseconds);
		var timeInSeconds = Math.floor(absoluteMilliseconds / MILLISECONDS);
		var tenths = Math.floor((absoluteMilliseconds % MILLISECONDS) / (MILLISECONDS / 10));
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

		return (this._milliseconds < 0 ? "-" : "") + display;
	}
	
	Time.prototype.getUnitString = function(defaultUnits) {
		var remaining = Math.floor(Math.abs(this._milliseconds) / MILLISECONDS);
		var divisor, quantity;

		return (this._milliseconds < 0 ? "-" : "") + "ywdhms".split("").map(function(units) {
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
	}

	return {
		seconds: "s",
		minutes: "m",
		hours: "h",
		days: "d",
		weeks: "w",
		years: "y",
		
		fromMilliseconds: function(milliseconds) {
			return new Time(milliseconds);
		},
		
		fromUnitString: function(unitString, defaultUnits) {
			defaultUnits = defaultUnits || "m";
			
			var timeInSeconds = 0;
			var unitsRegex = /[smhdwy]/i;
			var timeRegex = /\d/;
			var unitValues = {};
			var tokeniser = new Tokeniser(unitString);
			var time, units;
			
			while(!tokeniser.isEof()) {
				tokeniser.skipUntilMatches(timeRegex);
				time = parseInt(tokeniser.readWhileMatches(timeRegex) || "0");
				
				if(time > 0) {
					tokeniser.skipUntilMatches(unitsRegex);
					units = tokeniser.readWhileMatches(unitsRegex).charAt(0).toLowerCase() || defaultUnits;
					unitValues[units] = time;
				}
			}
			
			for(var units in unitValues) {
				if(units in unitMultipliers) {
					timeInSeconds += unitValues[units] * unitMultipliers[units];
				}
			}
			
			return new Time(timeInSeconds * MILLISECONDS);
		}
	};
});