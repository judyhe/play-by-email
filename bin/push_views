#!/usr/bin/env node

require('../lib/env');
var fs = require('fs');
var path = require('path');
var couchdb = require('../lib/couchdb');
var nano = require('nano')(process.env.CLOUDANT_URL);

var dbDir = path.normalize(__dirname + '/../db/');


fs.readdirSync(dbDir).forEach(function (dbName) {
  if (dbName[0] == '.' || dbName[0] == '_') return;

  nano.db.create(dbName, function (err, obj) {
    fs.readdir(dbDir + dbName, function (err, files) {
      files.forEach(function (file) {
        if (file.indexOf('.') == 0) return;

        processFile(dbName, file);
      });
    });
  })
});


function processFile(dbName, fileName) {
  var filePath = dbDir + dbName + '/' + fileName;
  var db = couchdb(dbName);

  var designDocName = path.basename(fileName, path.extname(fileName));

  var map = null;
  var views = {};

  fs.readFile(filePath, 'UTF-8', function (err, content) {
    var lines = content.split('\n');
    for (var i=0; i<lines.length; i++) {
      i = getNextStartLine(lines, i);
      if ( i == -1) break;

      var functionLine = lines[i].split('=');
      var name = functionLine[0].trim();
      var func = functionLine[1].trim() + '\n';

      i++;
      var j = getRestOfFunction(lines, i)
      func += lines.slice(i, j).join('\n');
      i = j;

      if (name == 'map') {
        map = func
      }
      else {
        views[name] = {map: map, reduce: func}
      }
    }

    if (_.size(views) == 0) views[designDocName] = {map: map};

    var id = '_design/' + designDocName;
    db.get(id, function (err, doc) {
      if (!err) {
        if (JSON.stringify(doc.views) != JSON.stringify(views)) {
          doc.views = views;
          saveDoc(db, doc);
        }
      }
      else if (err['status_code'] == 404) {
        doc = {};
        doc._id = id;
        doc.language = 'javascript';
        doc.views = views;
        saveDoc(db, doc);
      }
      else {
        console.log(err);
      }
    });

  });

}

function getNextStartLine(lines, i) {
  for (; i<lines.length; i++) {
    var line = lines[i].trim();
    if (line.length == 0 || line.substring(0, 2) == '//') continue;
    return i;
  }
  return -1;
}

function getRestOfFunction(lines, i) {
  for (; i<lines.length; i++) {
    if (lines[i].trim() == '};') return i + 1;
  }
}

function saveDoc(db, doc) {
  var designDocName = doc._id.substr(doc._id.indexOf('/') + 1);
  db.insert(doc, function (err, resp) {
    if (resp && resp.ok) {
      console.log('PUSHED ' + db.config.db + '/' + designDocName);
    }
    else {
      console.log('FAILED  ' + db.config.db + '/' + designDocName);
      console.log(err);
    }
  });
}