define(function(require) {
	var Event = require("lib/Event");
	var time = require("lib/time");
	require("lib/Array.getShallowCopy");
	var Position = require("./Position");
	var Colour = require("./Colour");
	var Move = require("./Move");
	var Fen = require("./Fen");
	var Result = require("./Result");
	var Clock = require("./Clock");
	var TimingStyle = require("./TimingStyle");
	var Time = require("./Time");

	function Game(options) {
		this.GameOver = new Event(this);
		this.Move = new Event(this);
		
		this._options = {
			startingFen: Fen.STARTING_FEN,
			history: [],
			isTimed: true,
			initialTime: "10m",
			timeIncrement: "0",
			isOvertime: false,
			overtimeFullmove: 40,
			overtimeBonus: "10m"
		};
		
		if(options) {
			for(var p in options) {
				this._options[p] = options[p];
			}
		}

		this._startTime = time();
		this._endTime = null;
		this._isInProgress = true;
		this._result = null;
		this._startingPosition = new Position(this._options.startingFen);
		this._history = this._options.history.getShallowCopy();
		
		if(this._history.length > 0) {
			this._position = this._history[this._history.length - 1].getPositionAfter();
		}
		
		else {
			this._position = new Position(this._options.startingFen);
		}
		
		if(this._options.isTimed) {
			this._clock = new Clock(this, new TimingStyle({
				initialTime: Time.fromUnitString(this._options.initialTime, Time.minutes),
				increment: Time.fromUnitString(this._options.timeIncrement, Time.seconds),
				isOvertime: this._options.isOvertime,
				overtimeFullmove: this._options.overtimeFullmove,
				overtimeBonus: Time.fromUnitString(this._options.overtimeBonus, Time.minutes)
			}));
			
			this._clock.Timeout.addHandler(this, function() {
				this._timeout();
			});
		}
	}
	
	Game.prototype.getStartTime = function() {
		return this._startTime;
	}
	
	Game.prototype.getEndTime = function() {
		return this._endTime;
	}
	
	Game.prototype.isInProgress = function() {
		return this._isInProgress;
	}
	
	Game.prototype.timingHasStarted = function() {
		return (this._options.isTimed && this._clock.timingHasStarted());
	}
	
	Game.prototype.getResult = function() {
		return this._result;
	}

	Game.prototype.isFiftymoveClaimable = function() {
		return (this._position.getFiftymoveClock() > 49);
	}
	
	Game.prototype.isThreefoldClaimable = function() {
		var currentFen = new Fen(this._position.getFen());
		var startingFen = new Fen(this._startingPosition.getFen());
		var limit = 3;
		var occurrences = 0;

		if(
			currentFen.position === startingFen.position
			&& currentFen.active === startingFen.active
			&& currentFen.castling === startingFen.castling
			&& currentFen.epTarget === startingFen.epTarget
		) {
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

		return (occurrences >= limit);
	}
	
	Game.prototype.getPosition = function() {
		return this._position.getCopy();
	}
	
	Game.prototype.getActiveColour = function() {
		return this._position.getActiveColour();
	}
	
	Game.prototype.getHistory = function() {
		return this._history.getShallowCopy();
	}

	Game.prototype.move = function(from, to, promoteTo) {
		var move = null;

		if(this._isInProgress) {
			move = new Move(this._position, from, to, promoteTo);
			
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
				this.Move.fire(move);
			}
		}
		
		return move;
	}
	
	Game.prototype.resign = function(colour) {
		if(this._isInProgress) {
			this._gameOver(Result.win(colour.opposite, Result.types.RESIGNATION));
		}
		
	}
	
	Game.prototype.drawByAgreement = function() {
		if(this._isInProgress) {
			this._gameOver(Result.draw(Result.types.DRAW_AGREED));
		}
	}
	
	Game.prototype.claimDraw = function() {
		if(this._isInProgress) {	
			if(this.isFiftymoveClaimable()) {
				this._gameOver(Result.draw(Result.types.FIFTYMOVE));
			}
			
			else if(this.isThreefoldClaimable()) {
				this._gameOver(Result.draw(Result.types.THREEFOLD));
			}
		}
	}
	
	Game.prototype._timeout = function() {
		var opponentColour = this._position.getActiveColour().opposite;
		
		if(this._position.playerCanMate(opponentColour)) {
			this._gameOver(Result.win(opponentColour, Result.types.TIMEOUT));
		}
		
		else {
			this._gameOver(Result.draw(Result.types.INSUFFICIENT));
		}
	}

	Game.prototype._gameOver = function(result) {
		this._result = result;
		this._isInProgress = false;
		this._endTime = time();
		
		if(this._options.isTimed) {
			this._clock.stop();
		}
		
		this.GameOver.fire(result);
	}

	return Game;
});