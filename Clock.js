define(function(require) {
	var time = require("lib/time");
	var Colour = require("./Colour");
	var Event = require("lib/Event");
	var Time = require("./Time");
	
	var MILLISECONDS = 1000;
	
	function Clock(game, timingStyle, getCurrentTime) {
		this.Timeout = new Event(this);
		
		this._game = game;
		this._lastMoveIndex = -1;
		this._timingStyle = timingStyle;
		this._timeoutTimer = null;
		this._startOrLastMoveTime = this._game.getStartTime() + this._timingStyle.initialDelay;
		this._isRunning = true;
		this._stopTime = null;
		this._getCurrentTime = getCurrentTime || time;
		
		this._timeLeft = {};
		this._timeLeft[Colour.white] = this._timingStyle.initialTime.getCopy();
		this._timeLeft[Colour.black] = this._timingStyle.initialTime.getCopy();
		
		this._game.getHistory().forEach((function(move) {
			this._move(move);
		}).bind(this));
		
		this._handleNewMoves();
		this._setTimeoutTimer();
	}
	
	Clock.prototype.getTimeLeft = function(colour) {
		var activeColour = this._getActiveColour();
		
		colour = colour || activeColour;
		
		var timeLeft = this._timeLeft[colour].getMilliseconds();
		
		if(colour === activeColour && this.timingHasStarted()) {
			var thinkingTime = (this._stopTime || this._getCurrentTime()) - this._startOrLastMoveTime;
			
			timeLeft -= thinkingTime;
		}
		
		return Time.fromMilliseconds(Math.max(0, timeLeft));
	}
	
	Clock.prototype.stop = function() {
		if(this._isRunning) {
			if(this._timeoutTimer !== null) {
				clearTimeout(this._timeoutTimer);
			}
			
			this._isRunning = false;
			this._stopTime = this._getCurrentTime();
		}
	}
	
	Clock.prototype.getDescription = function() {
		return this._timingStyle.getDescription();
	}
	
	Clock.prototype._handleNewMoves = function() {
		this._game.Move.addHandler(this, function(data) {
			if(this._isRunning) {
				this._move(data.move);
				this._setTimeoutTimer();
			}
		});
	}
	
	Clock.prototype._move = function(move) {
		var moveTime = move.getTime();
		var timeLeft = this._timeLeft[move.getColour()];
		var thinkingTime = moveTime - this._startOrLastMoveTime;
		
		if(this.timingHasStarted()) {
			timeLeft.subtract(thinkingTime);
			timeLeft.add(this._timingStyle.increment);
			
			if(this._timingStyle.isOvertime && move.getFullmove() === this._timingStyle.overtimeFullmove) {
				timeLeft.add(this._timingStyle.overtimeBonus);
			}
		}
		
		this._lastMoveIndex++;
		this._startOrLastMoveTime = moveTime;
	}
	
	Clock.prototype._setTimeoutTimer = function() {
		if(this._timeoutTimer !== null) {
			clearTimeout(this._timeoutTimer);
		}
		
		if(this.timingHasStarted()) {
			this._timeoutTimer = setTimeout((function() {
				this._timeout();
			}).bind(this), this.getTimeLeft());
		}
	}
	
	Clock.prototype._timeout = function() {
		if(this.getTimeLeft() <= 0) {
			this.stop();
			this.Timeout.fire();
		}
		
		else {
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype.timingHasStarted = function() {
		return (
			this._lastMoveIndex >= this._timingStyle.firstTimedMoveIndex - 1
			&& this._getCurrentTime() >= this._startOrLastMoveTime
		);
	}
	
	Clock.prototype._getActiveColour = function() {
		return this._game.getPosition().getActiveColour();
	}
	
	return Clock;
});