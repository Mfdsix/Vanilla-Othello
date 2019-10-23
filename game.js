var game = {

	canvas : null,
	rows : 8,
	cols : 8,
	grids : [],
	states : {
		'blank' : { 'id' : 0, 'color' : 'white' },
		'black' : { 'id' : 1, 'color' : 'black' },
		'white' : { 'id' : 2, 'color' : 'white' },
		'highlight' : { 'id' : 3, 'color' : 'grey' },
	},
	black : 0,
	white : 0,
	turn : null,

	init(){
		this.canvas = document.getElementById('game');
		this.initBoard();
		this.initGame();
	},
	initBoard(){
		var table = document.createElement('table');
		for(var row = 1; row <= this.rows; row++){
			var tr = document.createElement('tr');
			table.appendChild(tr);
			this.grids[row] = [];
			for(var col = 1; col <= this.cols; col++){
				var td = document.createElement('td');
				tr.appendChild(td);
				var span = document.createElement('span');
				this.grids[row][col] = this.initItemState(td.appendChild(span));
				this.bindMove(td, row, col);
			}
		}
		this.canvas.appendChild(table);
	},
	initGame(){
		this.setItemState(4,4, this.states.white);
		this.setItemState(4,5, this.states.black);
		this.setItemState(5,4, this.states.black);
		this.setItemState(5,5, this.states.white);
		this.setScore(2,2);
		this.setTurn(this.states.black);
	},
	initItemState(elem){
		return {
			'elem' : elem,
			'state' : this.states.blank
		};
	},
	bindMove(elem, row, col){
		var self = this;
		elem.onclick = function(){
			if(self.turn == self.states.black){
				if(self.isValidMove(row,col)){
					self.removeHighlight();
					self.move(row,col);
				}else{
					alert("Not Valid Move");
				}
			}
		}
	},
	setItemState(row, col, state){
		this.grids[row][col].state = state;
		if(state.id == 0){
			this.grids[row][col].elem.style.visibility = "hidden";
		}else{
			this.grids[row][col].elem.style.visibility = "visible";
			this.grids[row][col].elem.style.background = state.color;
		}
	},
	setScore(black, white){
		document.getElementById("black").innerHTML = "Black : " + black;
		document.getElementById("white").innerHTML = "White : " + white;
	},
	isValidMove(row,col){
		var rowCheck, colCheck,
		toCheck = (this.turn.id == this.states.black.id) ?
		this.states.white : this.states.black;

		if(!this.isValidPosition(row,col) || this.isVisibleItem(row,col)){
			return false;
		}
		for(var rowDir = -1; rowDir <= 1; rowDir++){
			for(var colDir = -1; colDir <= 1; colDir++){
				if(rowDir == 0 && colDir == 0){
					continue;
				}
				rowCheck = row + rowDir;
				colCheck = col + colDir;
				var found = false;

				while(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grids[rowCheck][colCheck].state.id == toCheck.id){
					rowCheck += rowDir;
					colCheck += colDir;
					found = true;
				}
				if(found){
					if(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grids[rowCheck][colCheck].state.id == this.turn.id){
						return true;
					}
				}
			}
		}
		return false;
	},
	isValidPosition(row,col){
		return (row >= 1 && row <= this.rows) && (col >= 1 && col <= this.cols);
	},
	isVisibleItem(row,col){
		return this.isVisible(this.grids[row][col].state);
	},
	isVisible(state){
		return (state.id == this.states.black.id) || (state.id == this.states.white.id);
	},
	move(row,col){
		var finalItems = [];
		var rowCheck, colCheck,
		toCheck = (this.turn.id == this.states.black.id) ?
		this.states.white : this.states.black;

		if(!this.isValidPosition(row, col) || this.isVisibleItem(row,col)){
			return false;
		}
		for(var rowDir = -1; rowDir <= 1; rowDir++){
			for(var colDir = -1; colDir <= 1; colDir++){
				if(rowDir == 0 && colDir == 0){
					continue;
				}

				rowCheck = row + rowDir;
				colCheck = col + colDir;
				var possibleItems = [];

				while(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grids[rowCheck][colCheck].state.id == toCheck.id){
					possibleItems.push([rowCheck, colCheck]);
					rowCheck += rowDir;
					colCheck += colDir;
				}
				if(possibleItems.length){
					if(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grids[rowCheck][colCheck].state.id == this.turn.id){
						finalItems.push([row,col]);
						for(var item in possibleItems){
							finalItems.push(possibleItems[item]);
						}
					}
				}
			}
			if(finalItems.length){
				for(var item in finalItems){
					this.setItemState(finalItems[item][0], finalItems[item][1], this.turn);
				}
			}
		}
		this.setTurn(toCheck);
		this.recalculate();
	},
	setTurn(state){
		this.turn = state;
		if(state.id == this.states.black.id){
			this.makeHighlight();
			document.getElementById("turn").innerHTML = "Black Turn";
		}else{
			document.getElementById("turn").innerHTML = "White Turn";
			var self = this;
			var timeout = setTimeout(function(){
				self.moveAI();
				clearTimeout(timeout);
			},1000);
		}
	},
	makeHighlight(){
		for(var row = 1; row <= this.rows; row++){
			for(var col = 1; col <= this.cols; col++){
				if(this.isValidMove(row,col)){
					this.setItemState(row,col,this.states.highlight);
				}
			}
		}
	},
	removeHighlight(){
		for(var row = 1; row <= this.rows; row++){
			for(var col = 1; col <= this.cols; col++){
				if(this.grids[row][col].state.id == 3){
					this.setItemState(row,col,this.states.blank);
				}
			}
		}
	},
	recalculate(){
		var black_score = 0,
		white_score = 0;
		for(var row = 1; row <= this.rows; row++){
			for(var col = 1; col <= this.cols; col++){
				if(this.grids[row][col].state.id == 1){
					black_score++;
				}else if(this.grids[row][col].state.id == 2){
					white_score++;
				}
			}
		}
		this.setScore(black_score, white_score);
	},
	moveAI(){
		for(var row = 1; row <= this.rows; row++){
			for(var col = 1; col <= this.cols; col++){
				if(this.isValidMove(row,col)){
					this.move(row,col);
					return;
				}
			}
		}
	}
}