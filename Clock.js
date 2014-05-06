define(function(require) {
	var time = require("lib/time");
	var Colour = require("./Colour");
	var Event = require("lib/Event");
	var Time = require("./Time");
	var Position = require("./Position");
	
	var MILLISECONDS = 1000;
	
	function Clock(timingStyle, startingPosition) {
		this.Timeout = new Event(this);
		
		this._timingStyle = timingStyle;
		this._isRunning = false;
		this._fullmove = startingFullmove;
		this._timeoutTimer = null;
		this._startOrLastMoveTime = null;
		this._startingPosition = startingPosition || new Position();
		this._activeColour = this._startingPosition.getActiveColour();
		
		this._timeLeft = {};
		this._timeLeft[Colour.white] = Time.fromMilliseconds(this._timingStyle.initialTime);
		this._timeLeft[Colour.black] = Time.fromMilliseconds(this._timingStyle.initialTime);
		
		this._description = this._timingStyle.getDescription();
	}
	
	Clock.prototype.start = function() {
		this._isRunning = true;
		this._startOrLastMoveTime = time();
		this._setTimeoutTimer();
	}
	
	Clock.prototype.stop = function() {
		this._isRunning = false;
		
		if(this._timeoutTimer !== null) {
			clearTimeout(this._timeoutTimer);
		}
	}
	
	Clock.prototype.playerMoved = function(move) {
		if(this._isRunning) {
			var now = time();
			var colour = move.getColour();
			var timeLeft = this._timeLeft[colour];
			var thinkingTime = now - this._startOrLastMoveTime;
			
			timeLeft.add(-thinkingTime);
			timeLeft.add(this._timingStyle.increment);
			
			if(this._timingStyle.isOvertime && move.getFullmove() === this._timingStyle.overtimeFullmove) {
				timeLeft.add(this._timingStyle.overtimeBonus);
			}
			
			this._startOrLastMoveTime = now;
			this._activeColour = colour.opposite;
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype.getTimeLeft = function(colour) {
		colour = colour || this._activeColour;
		
		var timeLeft = this._timeLeft[colour];
		
		if(colour === this._activeColour) {
			timeLeft.add(-(time() - this._startOrLastMoveTime));
		}
		
		return Time.fromMilliseconds(timeLeft);
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
		
		var timeLeft = this.getTimeLeft();
		
		if(timeLeft <= 0) {
			this.Timeout.fire({
				colour: this._activeColour
			});
			
			this.stop();
		}
		
		else {
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype.getDescription = function() {
		return this._description;
	}
	
	return Clock;
});