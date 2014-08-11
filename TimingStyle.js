define(function(require) {
	var Time = require("./Time");
	
	function TimingStyle(options) {
		this.initialTime = Time.fromUnitString("10m");
		this.increment = Time.fromMilliseconds(0);
		this.isOvertime = false;
		this.overtimeFullmove = 40;
		this.overtimeBonus = Time.fromUnitString("10m");
		this.firstTimedMoveIndex = 2;
		this.initialDelay = 0;
		
		for(var p in options) {
			this[p] = options[p];
		}
	}
	
	TimingStyle.prototype.getDescription = function() {
		var description;

		if(this.increment > 0) {
			description = this.initialTime.getUnitString(Time.minutes)
				+ " | "
				+ this.increment.getUnitString(Time.seconds);
		}
		
		else {
			description = this.initialTime.getUnitString();
		}
		
		if(this.isOvertime) {
			description += this.overtimeBonus.getUnitString(Time.minutes) + " @ move " + this.overtimeFullmove;
		}

		return description;
	}
	
	return TimingStyle;
});