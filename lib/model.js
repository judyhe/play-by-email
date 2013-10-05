var couchdb = require('./couchdb');

function Model(dbName) {
  this.db = couchdb(dbName);
  var _this = this;
  this.InstanceMethods = function (original) {
    this._original = JSON.stringify(original);
    this.dbName = dbName;

    this.save = function (callback) {
      return _this.save(this, callback);
    };

    this.changed = function (path) {
      return _this.changed(this, path);
    };
  };

  this.instance = this.InstanceMethods.prototype;
}

Model.prototype.destroy = function(docId, rev, callback){
  this.db.destroy(docId, rev, function(err, resp){
    if (err) return callback(err);
    callback(null, resp);
  });
};

Model.prototype.save = function (doc, callback) {
  var _this = this;

  var now = new Date().toISOString();
  if (!doc.created_at) doc.created_at = now;
  doc.updated_at = now;

  _this.db.insert(doc, doc._id, function (err, resp) {
    if (err) return callback(err, doc);

    doc._rev = resp.rev;
    _this.decorate(doc);
    callback(null, doc);
  });
};

Model.prototype.all = function(params, callback) {
  var _this = this;
  this.db.list(params, function(err, body){
    if (err) return callback(err);
    var docs = [];
    body.rows.forEach(function(doc){
      if (!/^_design\//.test(doc.id)) {
        _this.decorate(doc.doc);
        docs.push(doc.doc);
      }
    });

    callback(null, docs);
  });
}

Model.prototype.get = function (key, callback) {
  var _this = this;
  this.db.get(key, function (err, doc) {
    if (err) {
      if (err.status_code == 404) return callback(null, null);
      return callback(err);
    }
    _this.decorate(doc);
    callback(null, doc);
  });
};

Model.prototype.changed = function (doc, path) {
  var current = null;
  var original = null;

  try {
    with (doc) { current = eval(path); }
  }
  catch (err) {}

  try {
    if (typeof doc._original == 'string') {
      doc.__proto__._original = JSON.parse(doc._original);
    }
    with (doc._original) { original = eval(path) }
  }
  catch (err) {}
  return JSON.stringify(current) != JSON.stringify(original);
};

function defaultQueryOpts(viewName){
  return {
    designDoc: viewName,
    viewName: viewName,
    include_docs: true
  };
}

function buildParams(key, opts){
  // opts has everthing, params only has url query arguments to couch
  var params = {};

  // limit
  if (opts.singular){
    params['limit'] = 1;
  }

  // key can be string ('x') or array ['x', 'b']
  if (_.isString(key) || _.isArray(key)){
    opts['key'] = key;
  }

  _.each(['descending', 'include_docs'], function(k){
    if (opts[k]) {params[k] = opts[k];}
  });

  _.each(['key', 'startkey', 'endkey', 'limit'], function(k){
    if (opts[k]) {
      params[k] = opts.case_insensitive ? opts[k].toLowerCase() : opts[k];
    }
  });

  return params;
}

Model.prototype.findBy = function (viewName, opts) {
  opts = _.extend({}, defaultQueryOpts(viewName), opts);
  return function (key, callback) {
    var _this = this;
    var callOpts = _.isObject(key) ? _.extend({}, opts, key) : _.extend({}, opts);

    this.db.view(callOpts.designDoc, callOpts.viewName, buildParams(key, callOpts), function (err, body) {
      if (err) return callback(err);
      if (body) {
        result = (body && body.rows && body.rows.length > 0) ? body.rows : null;

        if (result) {
          var rowType = callOpts.include_docs ? 'doc' : 'value';
          result = _.map(result, function(row){return row[rowType];});

          if (callOpts.singular){
            result = result[0];
          }

          _this.decorate(result);
        }

        callback(null, result);
      }
    });
  };
};

Model.prototype.decorate = function (doc) {
  if (!doc) return;
  if (_.isArray(doc)){
    for(var i=0, len=doc.length; i<len; i++){
      doc[i].__proto__ = new this.InstanceMethods(doc[i]);
    }
  } else {
    doc.__proto__ = new this.InstanceMethods(doc);
  }
  return doc;
};

module.exports = function(dbName) {
  return new Model(dbName);
};
