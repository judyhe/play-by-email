var mailer = require('./../lib/mailer');

exports.newGame = function(to, cc, game, callback) {
  mailer.send('start', {board: game.board, id: game._id}, {
    to: to.email,
    subject: 'Player Dots: Round 1, Your Turn'
  }, callback);
};