define(function(require) {
	require("lib/Array.contains");
	var TimeParser = require("./TimeParser");
	var TimingStyle = require("./TimingStyle");
	
	return {
		encode: function(timingStyle, initialTime, increment) {
			var showDefaultUnits = !isIncrementStyle;
			var str = TimeParser.encode(initialTime, showDefaultUnits, "m");
	
			if(timingStyle.isIncrementStyle) {
				str += "/" + TimeParser.encode(increment, false, "s");
			}
	
			return str;
		},
	
		encodeFull: function(timingStyle, initialTime, increment, isOvertime, overtimeIncrement, overtimeCutoff) {
			var display = TimingStyle.noTimer.description;
	
			if(timingStyle !== TimingStyle.noTimer) {
				display = this.encode(timingStyle, initialTime, increment);
	
				if(timingStyle !== TimingStyle.suddenDeath) {
					display += " " + timingStyle.description;
				}
	
				if(isOvertime) {
					display += " + " + TimeParser.encode(overtimeIncrement, true) + " @ " + overtimeCutoff + " moves";
				}
			}
	
			return display;
		}
	};
});
