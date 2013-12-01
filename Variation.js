function Variation() {
	HistoryItem.implement(this);

	this._startingFullmove=1;
	this._startingColour=WHITE;
	this.autoUpdatePointers=true;
	this.isVariation=true;
	this.moveList=this._createMoveList();
	this.firstMove=null;
	this.lastMove=null;
}

Variation.prototype.getStartingFullmove=function() {
	return this._startingFullmove;
}

Variation.prototype.setStartingFullmove=function(fullmove) {
	this._startingFullmove=fullmove;
	this.updatePointers(true);
}

Variation.prototype.getStartingColour=function() {
	return this._startingColour;
}

Variation.prototype.setStartingColour=function(colour) {
	this._startingColour=colour;
	this.updatePointers(true);
}

Variation.prototype.resetPointers=function() {
	HistoryItem.prototype.resetPointers.call(this);

	this.branchMove=null; //the move before the first move of the variation
}

Variation.prototype.setBranchMove=function(move) {
	this.branchMove=move;
}

Variation.prototype.insert=function(item, index, noPointerUpdate) {
	var updatePointers=noPointerUpdate?false:this.autoUpdatePointers;

	this.moveList.insert(item, index);

	if(updatePointers) {
		this.updatePointers();
	}
}

Variation.prototype.remove=function(item, noPointerUpdate) {
	var updatePointers=noPointerUpdate?false:this.autoUpdatePointers;

	this.moveList.remove(item);

	if(updatePointers) {
		this.updatePointers();
	}
}

Variation.prototype.deleteMove=function(move, noPointerUpdate) {
	var updatePointers=noPointerUpdate?false:this.autoUpdatePointers;
	var item=move;

	while(item!==null) {
		this.remove(item, true);
		item=item.nextItem;
	}

	if(updatePointers) {
		this.updatePointers();
	}
}

Variation.prototype.add=function(item, noPointerUpdate) {
	this.insert(item, this.moveList.length, noPointerUpdate);
}

Variation.prototype.insertAfter=function(item, prevItem, noPointerUpdate) {
	if(prevItem===null) {
		this.insert(item, 0, noPointerUpdate);
	}

	else {
		var i=0;

		this.moveList.Each(function(item, index) {
			if(item===prevItem) {
				i=index;
			}
		});

		this.insert(item, i+1, noPointerUpdate);
	}
}

/*
insertAfterMove - the item will come after the move and all its variations
*/

Variation.prototype.insertAfterMove=function(item, prevMove, noPointerUpdate) {
	if(prevMove===null) {
		this.insert(item, 0, noPointerUpdate);
	}

	else {
		var prevItem=prevMove;

		while(prevItem.nextVariation!==null) {
			prevItem=prevItem.nextVariation;
		}

		this.insertAfter(item, prevItem, noPointerUpdate);
	}
}

Variation.prototype.updatePointers=function(recursive) {
	this.firstMove=null;
	this.lastMove=null;

	if(this.moveList.Length>0) {
		var lastMove=null;
		var previousVariation=null;
		var lastItem=null;
		var moveIndex=0;
		var halfmove=Util.halfmove(this._startingFullmove);

		if(this._startingColour===BLACK) {
			halfmove++;
		}

		if(!this.isMainline()) {
			halfmove=this.branchMove.halfmove;
		}

		this.firstMove=this.line.firstItem();

		this.moveList.each(function(item, i) {
			item.resetPointers();
			item.setVariation(this);
			item.setItemIndex(i);
			item.setPreviousMove(lastMove);
			item.setPreviousItem(lastItem);

			if(item.IsVariation) {
				item.setBranchMove(lastMove);

				if(recursive) {
					item.updatePointers(true);
				}

				if(lastItem!==null) {
					lastItem.setNextVariation(item);
				}

				previousVariation=item;
			}

			else {
				this.LastMove=item;

				item.setPreviousVariation(previous_variation);
				item.setHalfmove(halfmove);
				item.setMoveIndex(move_index);

				if(lastItem!==null) {
					lastItem.setNextMove(item);
				}

				if(lastMove!==null) {
					lastMove.setNextMove(item);
				}

				lastMove=item;
				previousVariation=null;
				halfmove++;
				moveIndex++;
			}

			if(lastItem!==null) {
				lastItem.setNextItem(item);
			}

			lastItem=item;
		}, this);
	}
}

Variation.prototype.isMainline=function() {
	return (this.variation===null);
}

Variation.prototype._createMoveList=function() {
	return new List();
}