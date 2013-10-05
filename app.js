require('./lib/env');

var express = require('express');
var app = express();
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public', { maxAge: 31557600000 }));
app.use(express.logger({ format: 'dev' }));
app.use(express.bodyParser());
app.use(app.router);

var Game = require('./models/game');

app.get('/', function(req, res){
  res.render('index');
});


var addressparser = require("addressparser");

app.post('/email', function(req, res){
  var subject = req.body.subject.toLowerCase().trim();

  res.send(200);
});

app.listen(process.env.PORT || 3000);