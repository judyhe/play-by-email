var Game = require('./../lib/model')('games');
var mailer = require('./../mailers/game');

// players: Array
//    name
//    email
//    score
// current_player: int
// board: Array 2d, cols first
// previous_board: Array
// round


Game.COLS = '123456';
Game.ROWS = 'abcdef';
Game.COLORS = [
  'e8da1f',
  '9a5ab8',
  '8bbcff',
  'e7613e',
  '8ce891'
];

Game.newGame = function(player1, otherPlayers, callback) {
  var game = new Game();
  game.board = Game.newBoard();
  game.current_player = 0;
  game.round = 1;
  
  if (otherPlayers.length < 1) return callback(new Error("Must CC another player"));

  var players = player1.concat(otherPlayers);

  for (var i=0, len=players.length; i<len; i++) {
    var user = {
      name: players[i].name,
      email: players[i].address,
      score: 0
    };
  }

  mailer.newGame(players[0], callback);
};

Game.playMoves = function(moves, board){
  if (moves.length < 2) return new Error("must select more than one dot");

  if (!Game.isAdjacent(moves[0], moves[1])) return new Error("dots must be adjacent");

  var color1 = Game.getColorFromPosition(moves[0], board);
  var color2 = Game.getColorFromPosition(moves[1], board);

  if (color1 !== color2) return new Error("dots must be the same color");

  var dotsToKill = [moves[0], moves[1]];

  for (var i=2, len=moves.length; i<len; i++) {
    if (Game.getColorFromPosition(moves[i], board) === color1 && Game.isAdjacent(moves[i], dotsToKill[i-1])) {
      dotsToKill[i] = moves[i];
    } else {
      break;
    }
  }

  if (Game.hasSquare(dotsToKill)) dotsToKill = Game.getPositionsFromColor(color1, board);

  var score = dotsToKill.length;

  return Game.killDots(dotsToKill, board);
};

Game.isAdjacent = function(position1, position2) {
  return Game.isAdjInRow(position1, position2) || Game.isAdjInCol(position1, position2);
};

Game.isAdjInRow = function(position1, position2) {
  var row1 = Game.getRowFromPosition(position1);
  var row2 = Game.getRowFromPosition(position2);
  var col1 = Game.getColFromPosition(position1);
  var col2 = Game.getColFromPosition(position2);

  if ((col2 === col1 + 1 || col2 === col1 - 1) && row1 === row2) return true;
};

Game.isAdjInCol = function(position1, position2) {
  var row1 = Game.getRowFromPosition(position1);
  var row2 = Game.getRowFromPosition(position2);
  var col1 = Game.getColFromPosition(position1);
  var col2 = Game.getColFromPosition(position2);

  if ((row2 === row1 + 1 || row2 === row1 - 1) && col1 === col2) return true;
};

Game.killDots = function(dotsPicked, board){
  // go through all the cols and find the dots in each col that we need to eliminate
  var rowLen = Game.ROWS.length;
  var colorsCount = Game.COLORS.length;

  var newBoard = [];

  for (var col=0, len=Game.COLS.length; col<len; col++) {
    newBoard[col] = [];
    var colorsToKeep = [];

    // go through all the rows in the col 2x
    // 1st time find the dots we're keeping
    // 2nd time to add new dots
    var row;
    for (row=0; row<rowLen; row++) {
    
      var isPicked = false;

      for (var d=0, den=dotsPicked.length; d<den; d++) {
        if (Game.getPositionFromRowCol(row, col) === dotsPicked[d]){
          isPicked = true;
          break;
        }
      }

      if (!isPicked) {
        colorsToKeep.push(board[col][row]);
      }
    }

    var keptColors = colorsToKeep.length;
    var switchToKeptColors = rowLen-keptColors;

    for (row=0; row<rowLen; row++) {
      if (row < switchToKeptColors) {
        newBoard[col][row] = Math.floor(Math.random()*colorsCount);
      } else {
        newBoard[col][row] = colorsToKeep[row-switchToKeptColors];
      }
    }
  }

  return newBoard;
};


Game.hasSquare = function(dotsToKill){
  if (dotsToKill < 3) return false;
  // todo: fill this in
};

Game.newBoard = function(){
  var board = [];
  var colorsCount = Game.COLORS.length;

  var colCount = Game.COLS.length;
  var rowCount = Game.ROWS.length;

  for (var col=0; col<colCount; col++) {
    board[col] = [];
    for (var row=0; row<rowCount; row++) {
      board[col][row] = Math.floor(Math.random()*colorsCount);
    }
  }
  return board;
};

// get the color for a string position on a board
// in: string ('a2', board
// return integer
Game.getColorFromPosition = function(rowCol, board) {
  var row = Game.getRowFromPosition(rowCol);
  var col = Game.getColFromPosition(rowCol);

  if (row === undefined && col === undefined) return false;
  
  return board[col][row];
};

// get all the string labels on a board for a color
// return array
Game.getPositionsFromColor = function(color, board) {
  var positions = [];

  for (var i=0, len=Game.COLS.length; i<len; i++) {
    
    for (var j=0, jen=Game.ROWS.length; j<jen; j++) {
      if (board[i][j] === color) {
        positions.push(Game.getPositionFromRowCol(j, i));
      }
    }
  }

  return positions;
};

// get the string label for the row and col 
// in: integer
// return string
Game.getPositionFromRowCol = function(row, col) {
  return Game.ROWS[row] + Game.COLS[col];
};

// in: string
// return integer
Game.getRowFromPosition = function(rowCol) {
  return Game.getRowIdx(rowCol.toLowerCase()[0]);
};

// in: string
// return integer
Game.getColFromPosition = function(rowCol) {
  return Game.getColIdx(rowCol[1]);
};

// in: string
// return integer
Game.getRowIdx = function(row) {
  return Game.getIdx(row, Game.ROWS);
};

// in: string
// return integer
Game.getColIdx = function(col) {
  return Game.getIdx(col, Game.COLS);
};

// in: string
// return integer
Game.getIdx = function(rowOrCol, arr) {
  for (var i=0, len=arr.length; i<len; i++) {
    if (arr[i] === rowOrCol) return i;
  }
};

module.exports = Game;