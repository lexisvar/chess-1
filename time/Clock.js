define(function(require) {
	var time = require("lib/time");
	var Colour = require("../Colour");
	
	var MILLISECONDS_PER_SECOND = 1000;
	
	function Clock(options) {
		this.TimeOut = new Event(this);
		
		this._options = {
			startingColour: Colour.white,
			startingFullmove: 1,
			initialTime: 600,
			increment: 0,
			incrementComesFirst: false,
			cappedIncrement: false,
			delay: 0,
			isOvertime: false,
			overtimeFullmove: 40,
			overtimeBonus: 600
		};
		
		for(var p in options) {
			this._options[p] = options[p];
		}
		
		this._isRunning = false;
		this._fullmove = this._options.startingFullmove;
		this._timeoutTimer = null;
		this._startOrLastMoveTime = null;
		this._activeColour = this._options.startingColour;
		
		var initialTime = this._options.initialTime * MILLISECONDS_PER_SECOND;
		
		this._timeLeft = {};
		this._timeLeft[Colour.white] = initialTime;
		this._timeLeft[Colour.black] = initialTime;
	}
	
	Clock.prototype.start = function() {
		this._isRunning = true;
		
		if(this._options.incrementComesFirst) {
			this._timeLeft[this._activeColour] += this._options.increment;
		}
		
		this._startOrLastMoveTime = time();
		this._setTimeoutTimer();
	}
	
	Clock.prototype.stop = function() {
		this._isRunning = false;
		
		if(this._timeoutTimer !== null) {
			clearTimeout(this._timeoutTimer);
		}
	}
	
	Clock.prototype.playerMoved = function() {
		if(this._isRunning) {
			var now = time();
			var timeLeft = this._timeLeft[this._activeColour];
			var thinkingTime = now - this._startOrLastMoveTime;
			var timeUsed = Math.max(0, thinkingTime - this._options.delay * MILLISECONDS_PER_SECOND);
			var increment = this._options.increment * MILLISECONDS_PER_SECOND;
			
			timeLeft -= timeUsed;
			
			if(this._options.incrementComesFirst) {
				this._timeLeft[this._activeColour.opposite] += increment;
			}
			
			else {
				if(this._options.cappedIncrement) {
					increment = Math.min(increment, timeUsed);
				}
				
				timeLeft += increment;
			}
			
			if(this._options.isOvertime && this._fullmove === this._options.overtimeFullmove) {
				timeLeft += this._options.overtimeBonus * MILLISECONDS_PER_SECOND;
			}
			
			if(this._activeColour === Colour.black) {
				this._fullmove++;
			}
			
			this._startOrLastMoveTime = now;
			this._activeColour = this._activeColour.opposite;
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype.getTimeLeft = function(colour) {
		colour = colour || this._activeColour;
		
		var timeLeft = this._timeLeft[colour];
		
		if(colour === this._activeColour) {
			timeLeft -= time() - this._startOrLastMoveTime;
		}
		
		return timeLeft;
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
			this.TimeOut.fire({
				colour: this._activeColour
			});
		}
		
		else {
			this._setTimeoutTimer();
		}
	}
	
	return Clock;
});