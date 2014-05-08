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
		
		if(colour === activeColour && this._timingHasStarted()) {
			var thinkingTime = this._getCurrentTime() - this._startOrLastMoveTime;
			
			timeLeft -= thinkingTime;
		}
		
		return Time.fromMilliseconds(Math.max(0, timeLeft));
	}
	
	Clock.prototype.getDescription = function() {
		return this._timingStyle.getDescription();
	}
	
	Clock.prototype._handleNewMoves = function() {
		this._game.Move.addHandler(this, function(data) {
			this._move(data.move);
			this._setTimeoutTimer();
		});
	}
	
	Clock.prototype._move = function(move) {
		var moveTime = move.getTime();
		var timeLeft = this._timeLeft[move.getColour()];
		var thinkingTime = moveTime - this._startOrLastMoveTime;
		
		if(this._timingHasStarted()) {
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
		
		if(this._timingHasStarted()) {
			this._timeoutTimer = setTimeout((function() {
				this._timeout();
			}).bind(this), this.getTimeLeft());
		}
	}
	
	Clock.prototype._timeout = function() {
		if(this.getTimeLeft() <= 0) {
			this.Timeout.fire();
		}
		
		else {
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype._timingHasStarted = function() {
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