define(function(require) {
	var Fen = require("./Fen");
	var Colour = require("./Colour");
	
	var files = "abcdefgh".split("");
	var ranks = "12345678".split("");

	var sanToFile = {
		"K": "h",
		"Q": "a"
	};
	
	var fileToSan = {
		"a": "Q",
		"h": "K"
	};
	
	function CastlingRight(colour, file) {
		this.colour = colour;
		this.file = file;
		this.sanSide = null;
		this.fenChar = null;
		this.isAllowed = false;
		
		if(file in fileToSan) {
			this.sanSide = fileToSan[file];
		}
		
		this.xFenChar = (colour === Colour.white ? file.toUpperCase() : file);
		
		if(this.sanSide !== null) {
			this.fenChar = (colour === Colour.white ? this.sanSide : this.sanSide.toLowerCase());
		}
	}

	function CastlingRights() {
		this._rights = {};

		Colour.forEach((function(colour) {
			this._rights[colour] = {};
			
			files.forEach((function(file) {
				this._rights[colour][file] = new CastlingRight(colour, file);
			}).bind(this));
		}).bind(this));
	}

	CastlingRights.prototype.set = function(colour, fileOrSan, allow) {
		var file = (fileOrSan in sanToFile ?  sanToFile[fileOrSan] : fileOrSan);
		
		this._rights[colour][file].isAllowed = allow;
	}

	CastlingRights.prototype.get = function(colour, fileOrSan) {
		var file = (fileOrSan in sanToFile ?  sanToFile[fileOrSan] : fileOrSan);
		
		return this._rights[colour][file].isAllowed;
	}

	CastlingRights.prototype.setFenString = function(fenString) {
		this.reset();

		if(fenString !== Fen.NONE) {
			var fenChar, fenCharLower, fenCharUpper;
			var colour, file;

			for(var i = 0; i < fenString.length; i++) {
				fenChar = fenString.charAt(i);
				fenCharLower = fenChar.toLowerCase();
				fenCharUpper = fenChar.toUpperCase();
				colour = (fenChar === fenCharUpper ? Colour.white : Colour.black);

				file = (fenCharUpper in sanToFile ? sanToFile[fenCharUpper] : fenCharLower);

				this.set(colour, file, true);
			}
		}
	}

	CastlingRights.prototype.getXFenString = function() {
		var xFenString = "";

		for(var colour in this._rights) {
			for(var file in this._rights[colour]) {
				if(this._rights[colour][file].isAllowed) {
					xFenString += this._rights[colour][file].xFenChar;
				}
			}
		}
		
		if(xFenString === "") {
			xFenString = Fen.NONE;
		}

		return xFenString;
	}

	CastlingRights.prototype.getFenString = function() {
		var fenString = "";
		var right;

		for(var colour in this._rights) {
			for(var file in this._rights[colour]) {
				right = this._rights[colour][file];
				
				if(right.isAllowed && right.sanSide !== null) {
					fenString += right.fenChar;
				}
			}
		}
		
		if(fenString === "") {
			fenString = Fen.NONE;
		}

		return fenString;
	}

	return CastlingRights;
});