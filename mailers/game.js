var mailer = require('./../lib/mailer');

exports.newGame = function(to, cc, game, callback) {
  mailer.send('start', {board: game.board, id: game._id}, {
    to: to.email,
    subject: 'Player Dots: Round 1, Your Turn'
  }, callback);
};

exports.play = function(to, currentPlayer, game, moves, callback){
  var subj = currentPlayer ? 'Your Turn' : 'Chill Out';

  mailer.send('play', {
    board: game.board,
    id: game._id,
    previous_board: game.previous_board,
    moves: moves,
    isCurrentPlayer: currentPlayer
  }, {
    to: to.email,
    subject: 'Player Dots: Round' + game.round + ', ' + subj + ', Score: ' + to.score
  }, callback);
};