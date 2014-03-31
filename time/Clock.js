define(function(require) {
	var time = require("lib/time");
	var Colour = require("../Colour");
	
	function Clock(options) {
		this.TimeOut = new Event(this);
		
		this._options = {
			clockStartHalfmove: 1,
			clockStartDelay: 0,
			initialTime: 600,
			increment: 0,
			delay: 0,
			unusedDelayBonus: false,
			isOvertime: false,
			overtimeFullmove: 40,
			overtimeBonus: 600
		};
		
		for(var p in options) {
			this._options[p] = options[p];
		}
		
		this._halfmove = 0;
		this._timeoutTimer = null;
		this._startTime= null;
		this._lastMoveTime = null;
		this._timeLeft = {};
		this._timeLeft[Colour.white] = this._options.initialTime;
		this._timeLeft[Colour.black] = this._options.initialTime;
	}
	
	Clock.prototype.start = function() {
		this._startTime = time();
		this._setTimeoutTimer();
	}
	
	Clock.prototype.playerMoved = function(colour) {
		
	}
	
	Clock.prototype._setTimeoutTimer = function() {
		
	}
	
	return Clock;
});