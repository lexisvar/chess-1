define(function(require) {
	var time = require("lib/time");
	var Colour = require("./Colour");
	var Event = require("lib/Event");
	var TimePeriod = require("chess/TimePeriod");
	
	var MILLISECONDS = 1000;
	
	function Clock(options) {
		this.Timeout = new Event(this);
		
		this._options = {
			startingColour: Colour.white,
			startingFullmove: 1,
			initialTime: "10m",
			increment: "0",
			isOvertime: false,
			overtimeFullmove: 40,
			overtimeBonus: "10m"
		};
		
		for(var p in options) {
			this._options[p] = options[p];
		}
		
		this._initialTime = TimePeriod.parse(this._options.initialTime, "m") * MILLISECONDS;
		this._increment = TimePeriod.parse(this._options.increment, "s") * MILLISECONDS;
		this._overtimeBonus = TimePeriod.parse(this._options.overtimeBonus, "m") * MILLISECONDS;
		
		this._isRunning = false;
		this._fullmove = this._options.startingFullmove;
		this._timeoutTimer = null;
		this._startOrLastMoveTime = null;
		this._activeColour = this._options.startingColour;
		
		this._timeLeft = {};
		this._timeLeft[Colour.white] = this._initialTime;
		this._timeLeft[Colour.black] = this._initialTime;
		
		this._shortDescription = this._getShortDescription();
		this._longDescription = this._getLongDescription();
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
	
	Clock.prototype.playerMoved = function() {
		if(this._isRunning) {
			var now = time();
			var timeLeft = this._timeLeft[this._activeColour];
			var thinkingTime = now - this._startOrLastMoveTime;
			
			timeLeft -= thinkingTime;
			timeLeft += this._increment;
			
			if(this._options.isOvertime && this._fullmove === this._options.overtimeFullmove) {
				timeLeft += this._overtimeBonus;
			}
			
			if(this._activeColour === Colour.black) {
				this._fullmove++;
			}
			
			this._timeLeft[this._activeColour] = timeLeft;
			
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
			this.Timeout.fire({
				colour: this._activeColour
			});
			
			this.stop();
		}
		
		else {
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype._getShortDescription = function() {
		var description = TimePeriod.encode(this._initialTime / MILLISECONDS, "m");

		if(this._increment > 0) {
			description += "/" + TimePeriod.encode(this._increment / MILLISECONDS, "s");
		}

		return description;
	}
	
	Clock.prototype._getLongDescription = function() {
		/*
		TODO
		*/
		
		/*
		 function(timingStyle, initialTime, increment, isOvertime, overtimeIncrement, overtimeCutoff) {
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
		*/
	}
	
	return Clock;
});