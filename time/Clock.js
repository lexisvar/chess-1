define(function(require) {
	var time = require("lib/time");
	var Colour = require("../Colour");
	
	function Clock(options) {
		this.TimeOut = new Event(this);
		
		this._options = {
			startingColour: Colour.white,
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
		
		this._isRunning = false;
		this._halfmove = 0;
		this._timeoutTimer = null;
		this._startOrLastMoveTime = null;
		this._activeColour = this._options.startingColour;
		this._timeLeft = {};
		this._timeLeft[Colour.white] = this._options.initialTime;
		this._timeLeft[Colour.black] = this._options.initialTime;
	}
	
	Clock.prototype.start = function() {
		this._isRunning = true;
		this._startOrLastMoveTime = time();
		this._setTimeoutTimer();
	}
	
	Clock.prototype.playerMoved = function() {
		if(this._isRunning) {
			var now = time();
			var thinkingTime = now - this._startOrLastMoveTime;
			
			this._startOrLastMoveTime = now;
			this._activeColour = this._activeColour.opposite;
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype._setTimeoutTimer = function() {
		if(this._timeoutTimer !== null) {
			clearTimeout(this._timeoutTimer);
		}
		
		this._timeoutTimer = setTimeout((function() {
			this._timeout();
		}).bind(this), this._timeLeft[this._activeColour]);
	}
	
	Clock.prototype._timeout = function() {
		clearTimeout(this._timeoutTimer);
		
		this.TimeOut.fire({
			colour: this._activeColour
		});
	}
	
	return Clock;
});