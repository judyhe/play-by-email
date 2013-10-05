require('./lib/env');

var express = require('express');
var app = express();
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public', { maxAge: 31557600000 }));
app.use(express.logger({ format: 'dev' }));
app.use(express.bodyParser());
app.use(app.router);


app.get('/', function(req, res){
  Game.get('d98c33eea1383654990c8916830005a8', function(err, game){
    var board = game.board;
    res.render('index', {board: board, next_board: null, moves: []});
  });
});

app.post('/', function(req, res){
  Game.get('d98c33eea1383654990c8916830005a8', function(err, game){
    var board = game.board;

    var moves = _.map(req.body.moves.split(','), function(move) {return move.trim();});
    var next_board = Game.playMoves(moves, board);
    if (next_board instanceof Error) {
      res.render('error', {error: next_board});
    } else {
      res.render('index', {board: board, next_board: next_board, moves: moves});
    }
  });
});

var addressparser = require("addressparser");

app.post('/play', function(req, res){
  console.log(req.body);
  var subject = req.body.subject.toLowerCase().trim();
  var from = addressparser(req.body.from);
  var cc = addressparser(req.body.cc);

  if (!from || from.length < 1) return res.send(200);

  if (subject === "start") {
    Game.newGame(from, cc, function(err){
      if (err) {
        console.log('ERROR', err);
        res.send(500);
      } else {
        res.send(200);
      }
    });
  } else {
    // find the gameid
    var gameid = req.body.text.match(/gameid:.*/);
    if (!gameid) return res.send(200);
    gameid = gameid.split(':');

    Game.get(gameid[1], function(err, game){
      if (err || !game.board) {
        console.log('ERROR', err); // todo: send an email about the error
        return res.send(200);
      }

      var moves = req.body.text.match(/(.|\n)*>>>REPLY ABOVE/);
      game.update(moves, function(err){
        if (err) console.log('ERROR', err); // todo: send an email
        return res.send(200);
      });
    });
  }
});

require('repl').start('> ');

app.listen(process.env.PORT || 3000);