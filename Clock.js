define(function(require) {
	var time = require("lib/time");
	var Colour = require("./Colour");
	var Event = require("lib/Event");
	var Time = require("./Time");
	var Position = require("./Position");
	
	var MILLISECONDS = 1000;
	
	function Clock(game, timingStyle) {
		this.Timeout = new Event(this);
		
		this._game = game;
		this._lastMoveIndex = -1;
		this._timingStyle = timingStyle;
		this._timeoutTimer = null;
		this._startOrLastMoveTime = this._game.getStartTime() + this._timingStyle.initialDelay;
		
		this._timeLeft = {};
		this._timeLeft[Colour.white] = Time.fromMilliseconds(this._timingStyle.initialTime);
		this._timeLeft[Colour.black] = Time.fromMilliseconds(this._timingStyle.initialTime);
		
		this._game.getHistory().forEach((function(move) {
			this._move(move);
		}).bind(this));
		
		this._handleNewMoves();
		this._setTimeoutTimer();
	}
	
	Clock.prototype.getTimeLeft = function(colour) {
		var activeColour = this._getActiveColour();
		var timeLeft = this._timeLeft[colour || activeColour];
		
		if(colour === activeColour && this._lastMoveIndex >= this._timingStyle.firstTimedMoveIndex - 1) {
			timeLeft.add(-(time() - this._startOrLastMoveTime));
		}
		
		return Time.fromMilliseconds(timeLeft);
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
		
		if(this._lastMoveIndex >= this._timingStyle.firstTimedMoveIndex) {
			timeLeft.add(-thinkingTime);
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
		
		this._timeoutTimer = setTimeout((function() {
			this._timeout();
		}).bind(this), this.getTimeLeft());
	}
	
	Clock.prototype._timeout = function() {
		if(this.getTimeLeft() <= 0) {
			this.Timeout.fire();
		}
		
		else {
			this._setTimeoutTimer();
		}
	}
	
	Clock.prototype._getActiveColour = function() {
		return this._game.getPosition().getActiveColour();
	}
	
	return Clock;
});