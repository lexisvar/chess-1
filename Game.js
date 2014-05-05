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
		
		this._options = {
			startingFen: Fen.STARTING_FEN,
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
		this._result = null;
		this._position = new Position(this._options.startingFen);
		this._startingPosition = new Position(this._options.startingFen);
		this._history = [];
		
		if(this._options.isTimed) {
			this._clock = new Clock(new TimingStyle({
				initialTime: Time.fromUnitString(this._options.initialTime, Time.minutes),
				increment: Time.fromUnitString(this._options.timeIncrement, Time.seconds),
				isOvertime: this._options.isOvertime,
				overtimeFullmove: this._options.overtimeFullmove,
				overtimeBonus: Time.fromUnitString(this._options.overtimeBonus, Time.minutes)
			}), this._position.getFullmove(), this._position.getActiveColour());
			
			this._clock.Timeout.addHandler(this, function(data) {
				this._timeout(data.colour);
			});
			
			this._clock.start();
		}
	}
	
	Game.prototype.getStartTime = function() {
		return this._startTime;
	}
	
	Game.prototype.getEndTime = function() {
		return this._endTime;
	}
	
	Game.prototype.isInProgress = function() {
		return (this._endTime === null);
	}
	
	Game.prototype.getResult = function() {
		return this._result;
	}

	Game.prototype.isFiftymoveClaimable = function() {
		return (this._position.getFiftymoveClock() > 49);
	}
	
	Game.prototype.isThreefoldClaimable = function() {
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

		return (occurrences >= limit);
	}
	
	Game.prototype.getPosition = function() {
		return this._position.getCopy();
	}
	
	Game.prototype.getHistory = function() {
		return this._history.getShallowCopy();
	}

	Game.prototype.move = function(from, to, promoteTo) {
		var move = null;

		if(this.isInProgress()) {
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
			}
		}
		
		return move;
	}
	
	Game.prototype.resign = function(colour) {
		this._gameOver(Result.win(colour.opposite, Result.types.RESIGNATION));
	}
	
	Game.prototype.drawByAgreement = function() {
		this._gameOver(Result.draw(Result.types.DRAW_AGREED));
	}
	
	Game.prototype.claimDraw = function() {
		var success = true;
		
		if(this.isFiftymoveClaimable()) {
			this._gameOver(Result.draw(Result.types.FIFTYMOVE));
		}
		
		else if(this.isThreefoldClaimable()) {
			this._gameOver(Result.draw(Result.types.THREEFOLD));
		}
		
		else {
			success = false;
		}
		
		return success;
	}
	
	Game.prototype._timeout = function(colour) {
		if(this._position.playerCanMate(colour.opposite)) {
			this._gameOver(Result.win(colour.opposite, Result.types.TIMEOUT));
		}
		
		else {
			this._gameOver(Result.draw(Result.types.INSUFFICIENT));
		}
	}

	Game.prototype._gameOver = function(result) {
		this._result = result;
		this._endTime = time();
		
		this.GameOver.fire({
			result: result,
		});
	}

	return Game;
});