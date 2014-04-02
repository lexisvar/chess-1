/*
TODO merge these into one class called "TimePeriod"

TimePeriod.fromString <-- TimeParser
timePeriod.getColonDisplay <-- TimeUtils
*/

var TimeUtils = {
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

var TimeParser=(function() {
	var numberRe=/\d/;
	var unitRe=/[ywdhms]/i;

	var unitMultipliers={
		"s": 1,
		"m": 60,
		"h": 60,
		"d": 24,
		"w": 7,
		"y": 52
	};

	/*
	calculate how many seconds are in one of each unit for later calculations
	*/

	var secondsMultipliers={};
	var multiplier=1;

	for(var unit in unitMultipliers) {
		multiplier*=unitMultipliers[unit];
		secondsMultipliers[unit]=multiplier;
	}

	var timeString="";
	var currentChar="";
	var i=-1;
	var chars=[];
	var currentTime=0;

	function setString(str) {
		timeString=str;
		chars=str.split("");
		reset();
	}

	function reset() {
		i=-1;
		currentChar="";
		currentTime=0;
	}

	function readTime(defaultUnits) {
		var number=readNumber();
		var unit=readUnits(defaultUnits);
		var multiplier=secondsMultipliers[unit];

		return number*multiplier;
	}

	function readNumber() {
		while(!match(numberRe) && !eof()) {
			next();
		}

		var str="";
		var n=0;

		if(!eof()) {
			while(match(numberRe)) {
				str+=read();
			}

			if(str.length>0) {
				n=parseInt(str);
			}
		}

		return n;
	}

	function readUnits(defaultUnits) {
		var unit=defaultUnits;

		while(!match(unitRe) && !eof()) {
			next();
		}

		if(!eof()) {
			unit=read();
		}

		return unit.toLowerCase();
	}

	function next() {
		i++;

		if(eof()) {
			currentChar="";
		}

		else {
			currentChar=chars[i];
		}
	}

	function eof() {
		return (i>=timeString.length);
	}

	function read() {
		var str=currentChar;

		next();

		return str;
	}

	function eq(str) {
		return (currentChar===str);
	}

	function match(re) {
		return (re.test(currentChar));
	}

	return {
		defaultUnits: "m",

		parse: function(timeString, defaultUnits) {
			defaultUnits=defaultUnits||this.defaultUnits;

			setString(timeString);
			reset();
			next();

			while(!eof()) {
				currentTime+=readTime(defaultUnits);
			}

			return currentTime;
		},

		encode: function(time, displayDefaultUnits, defaultUnits) {
			if(is_undefined(displayDefaultUnits)) {
				displayDefaultUnits=true;
			}

			defaultUnits=defaultUnits||this.defaultUnits;

			var timeString="0";

			if(time>0) {
				var parts={};
				var remaining=time;
				var divider, quantity;

				var units=[];

				for(var unit in secondsMultipliers) {
					units.push(unit);
				}

				units.reverse();

				for(i=0; i<units.length; i++) {
					divider=secondsMultipliers[units[i]];

					if(remaining>=divider) {
						quantity=Math.floor(remaining/divider);
						remaining=remaining%divider;
						parts[units[i]]=quantity;
					}
				}

				var unitStrings=[];

				for(var unit in parts) {
					if(unit===defaultUnits && time%secondsMultipliers[unit]===0 && !displayDefaultUnits) {
						unitStrings.push(parts[unit]);
					}

					else {
						unitStrings.push(parts[unit]+unit);
					}
				}

				timeString=unitStrings.join("");
			}

			return timeString;
		}
	};
})();