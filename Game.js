define(function(require) {
	var Event = require("js/Event");
	var time = require("js/time");
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
			startTime: time(),
			initialTime: 1000 * 60 * 10,
			timeIncrement: 0,
			isOvertime: false,
			overtimeFullmove: 40,
			overtimeBonus: 1000 * 60 * 10
		};
		
		if(options) {
			for(var p in options) {
				this._options[p] = options[p];
			}
		}

		this.startTime = this._options.startTime;
		this.endTime = null;
		this.isInProgress = true;
		this.result = null;
		this.startingPosition = new Position(this._options.startingFen); //FIXME not starting fen.  probs just remove the startingFen option.
		this.history = this._options.history.slice();
		
		if(this.history.length > 0) {
			this.position = this.history[this.history.length - 1].positionAfter;
		}
		
		else {
			this.position = new Position(this._options.startingFen);
		}
		
		//FIXME fix code to use game.position.activeColour instead of game.activeColour
		
		if(this._options.isTimed) {
			this._clock = new Clock(this, new TimingStyle({
				initialTime: this._options.initialTime,
				increment: this._options.timeIncrement,
				isOvertime: this._options.isOvertime,
				overtimeFullmove: this._options.overtimeFullmove,
				overtimeBonus: this._options.overtimeBonus
			}));
			
			this._clock.Timeout.addHandler(function() {
				this._timeout();
			}, this);
		}
	}
	
	Game.prototype.getTimeLeft = function(colour) {
		return (this._options.isTimed ? this._clock.getTimeLeft(colour) : Infinity);
	}
	
	Game.prototype.getTimingStyle = function() {
		return (this._options.isTimed ? this._clock.getTimingStyle() : null);
	}
	
	Game.prototype.timingHasStarted = function() {
		return (this._options.isTimed && this._clock.timingHasStarted());
	}

	Game.prototype.isFiftymoveClaimable = function() {
		return (this.position.fiftymoveClock > 49);
	}
	
	Game.prototype.isThreefoldClaimable = function() {
		//FIXME do this without using FENs
		var currentFen = new Fen(this.position.getFen());
		var startingFen = new Fen(this.startingPosition.getFen());
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

		this.history.forEach(function(move) {
			fen = new Fen(move.positionAfter.getFen());
			
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
	
	Game.prototype.getLastMove = function() {
		return this.history[this.history.length - 1] || null;
	}

	Game.prototype.move = function(from, to, promoteTo) {
		var move = null;

		if(this.isInProgress) {
			move = new Move(this.position, from, to, promoteTo);
			
			var colour = move.getColour();
			
			if(move.isLegal()) {
				this.position = move.positionAfter;
	
				if(move.isMate()) {
					this._gameOver(Result.win(colour, Result.types.CHECKMATE));
				}
	
				else {
					if(!this.position.playerCanMate(Colour.white) && !this.position.playerCanMate(Colour.black)) {
						this._gameOver(Result.draw(Result.types.INSUFFICIENT));
					}
	
					if(this.position.countLegalMoves(colour.opposite) === 0) {
						this._gameOver(Result.draw(Result.types.NO_MOVES));
					}
				}
	
				this.history.push(move);
				this.Move.fire(move);
			}
		}
		
		return move;
	}
	
	Game.prototype.resign = function(colour) {
		if(this.isInProgress) {
			this._gameOver(Result.win(colour.opposite, Result.types.RESIGNATION));
		}
		
	}
	
	Game.prototype.drawByAgreement = function() {
		if(this.isInProgress) {
			this._gameOver(Result.draw(Result.types.DRAW_AGREED));
		}
	}
	
	Game.prototype.claimDraw = function() {
		if(this.isInProgress) {	
			if(this.isFiftymoveClaimable()) {
				this._gameOver(Result.draw(Result.types.FIFTYMOVE));
			}
			
			else if(this.isThreefoldClaimable()) {
				this._gameOver(Result.draw(Result.types.THREEFOLD));
			}
		}
	}
	
	Game.prototype.addTimeToClock = function(time, colour) {
		this._clock.addTime(time, colour);
	}
	
	Game.prototype._timeout = function() {
		var opponentColour = this.position.activeColour.opposite;
		
		if(this.position.playerCanMate(opponentColour)) {
			this._gameOver(Result.win(opponentColour, Result.types.TIMEOUT));
		}
		
		else {
			this._gameOver(Result.draw(Result.types.TIMEOUT));
		}
	}

	Game.prototype._gameOver = function(result) {
		this.result = result;
		this.isInProgress = false;
		this.endTime = time();
		this.GameOver.fire(result);
	}

	return Game;
});