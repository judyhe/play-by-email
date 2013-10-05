var nano = require('nano')(process.env.CLOUDANT_URL);

module.exports = function(dbName) {
  return nano.db.use(dbName);
};
