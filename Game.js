define(function(require) {
	var Event = require("lib/Event");
	var time = require("lib/time");
	require("lib/Array.getShallowCopy");
	var Position = require("./Position");
	var Colour = require("./Colour");
	var Move = require("./Move");
	var Fen = require("./Fen");
	var Result = require("./Result");

	function Game(options) {
		this._state = Game.states.IN_PROGRESS;
		this._startTime = time();
		this._endTime = null;
		this._result = null;
		this._resultType = null;
		
		this._options = {
			startingFen: Fen.STARTING_FEN,
			clockStartHalfmove: 1,
			clockStartDelay: 0,
			initialTime: 600,
			timeIncrement: 0,
			timingStyle: Game.timingStyles.SUDDEN_DEATH,
			isOvertime: false,
			overtimeFullmove: 40,
			overtimeBonus: 600,
			isRated: true
		};
		
		for(var p in options) {
			this._options[p] = options[p];
		}
		
		this._isThreefoldClaimable = false;
		this._isFiftymoveClaimable = false;

		this._position = new Position(this._options.startingFen);
		this._startingPosition = new Position(this._options.startingFen);
		this._history = [];
		
		this._checkTimeTimeout = null;
		this._clocks = {};
		this._clocks[Colour.white] = this._options.initialTime;
		this._clocks[Colour.black] = this._options.initialTime;
	}
	
	Game.states = {
		IN_PROGRESS: "In progress",
		FINISHED: "Finished"
	};
	
	Game.timingStyles = {
		SUDDEN_DEATH: "Sudden death",
		FISCHER: "Fischer",
		FISCHER_AFTER: "Fischer After",
		BRONSTEIN_DELAY: "Bronstein delay",
		SIMPLE_DELAY: "Simple delay",
		HOURGLASS: "Hourglass",
		PER_MOVE: "Per move",
		NONE: "None"
	};
	
	Game.prototype.getState = function() {
		return this._state;
	}
	
	Game.prototype.getStartTime = function() {
		return this._startTime;
	}
	
	Game.prototype.getEndTime = function() {
		return this._endTime;
	}
	
	Game.prototype.getResult = function() {
		return this._result;
	}
	
	Game.prototype.getResultType = function() {
		return this._resultType;
	}

	Game.prototype.isFiftymoveClaimable = function() {
		return (this._position.getFiftymoveClock() > 49);
	}
	
	Game.prototype.isThreefoldClaimable = function() {
		return this._isThreefoldClaimable;
	}
	
	Game.prototype.getPosition = function() {
		return this._position.getCopy();
	}
	
	Game.prototype.getHistory = function() {
		return this._history.getShallowCopy();
	}

	Game.prototype.move = function(from, to, promoteTo) {
		if(this._state === Game.states.IN_PROGRESS) {
			var move = new Move(this._position, from, to, promoteTo);
			var colour = move.getColour();
	
			if(move.isLegal()) {
				this._position = move.getPositionAfter();
	
				if(move.isMate()) {
					this._gameOver(Result.win(colour, Result.types.CHECKMATE));
				}
	
				else {
					if(!this._position.playerCanMate(Colour.white) && !this._position.playerCanMate(Colour.black)) {
						this._gameOver(Result.draw(Result.types.INSUFFICIENT));
					}
	
					if(this._position.countLegalMoves(colour.opposite) === 0) {
						this._gameOver(Result.draw(Result.types.NO_MOVES));
					}
				}
	
				this._history.push(move);
				this._checkThreefold();
				this._checkTime();
			}
			
			return move;
		}
	}
	
	Game.prototype.resign = function(colour) {
		this._gameOver(Result.win(colour.opposite, Result.types.RESIGNATION));
	}

	Game.prototype.undoLastMove = function() {
		this._history.pop();
		
		var move = this._getLastMove();
		
		if(move !== null) {
			this._position = move.getPositionAfter();
		}
		
		else {
			this._position = this._startingPosition.getCopy();
		}
		
		this._checkThreefold();
		this._checkTime();
	}
	
	Game.prototype._getLastMove = function() {
		return this._history[this._history.length - 1] || null;
	}

	Game.prototype._checkTime = function() {
		this._calculateTime();
		this._checkForTimeouts();
		
		if(this._state !== Game.states.FINISHED) {
			this._scheduleNextTimeCheck();
		}
	}
	
	Game.prototype._scheduleNextTimeCheck = function() {
		var timeLeft = this._clocks[this._position.getActiveColour()];
		
		if(this._checkTimeTimeout !== null) {
			clearTimeout(this._checkTimeTimeout);
		}
		
		this._checkTimeTimeout = setTimeout((function() {
			this._checkTime();
		}).bind(this), timeLeft);
	}
	
	Game.prototype._checkForTimeouts = function() {
		Colour.forEach((function(colour) {
			if(this._clocks[colour] <= 0) {
				if(this._position.playerCanMate(colour.opposite)) {
					this._gameOver(Result.win(colour.opposite, Result.types.TIMEOUT));
				}
				
				else {
					this._gameOver(Result.draw(Result.types.INSUFFICIENT));
				}
				
			}
		}).bind(this));
	}

	Game.prototype._calculateTime = function() {
		//TODO
	}

	Game.prototype._checkThreefold = function() {
		var currentFenString = this._position.getFen();
		var currentFen = new Fen(currentFenString);
		var limit = 3;
		var occurrences = 0;

		if(currentFenString === this._startingPosition.getFen()) {
			limit = 2;
		}
		
		var fen;

		this._history.forEach(function(move) {
			fen = new Fen(move.getPositionAfter().getFen());
			
			if(
				fen.position === currentFen.position
				&& fen.active === currentFen.active
				&& fen.castling === currentFen.castling
				&& fen.epTarget === currentFen.epTarget
			) {
				occurrences++;
			}
		});

		this._isThreefoldClaimable = (occurrences >= limit);
	}

	Game.prototype._gameOver = function(result, resultType) {
		this._state = Game.states.FINISHED;
		this._result = result;
		this._resultType = resultType;
		this._endTime = time();
	}

	return Game;
});