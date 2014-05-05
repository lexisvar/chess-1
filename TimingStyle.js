define(function(require) {
	var Time = require("./Time");
	var Colour = require("./Colour");
	
	function TimingStyle(options) {
		this.initialTime = Time.fromUnitString("10m");
		this.increment = Time.fromMilliseconds(0);
		this.isOvertime = false;
		this.overtimeFullmove = 40;
		this.overtimeBonus = Time.fromUnitString("10m");
		
		for(var p in options) {
			this[p] = options[p];
		}
	}
	
	TimingStyle.prototype.getDescription = function() {
		var description = this.initialTime.getUnitString(Time.minutes);

		if(this.increment > 0) {
			description += "/" + this.increment.getUnitString(Time.seconds);
		}
		
		if(this.isOvertime) {
			description += this.overtimeBonus.getUnitString(Time.minutes) + " @ move " + this.overtimeFullmove;
		}

		return description;
	}
	
	return TimingStyle;
});