var rethinkdb = require('rethinkdb');
require('rethinkdb-init')(rethinkdb);
var appconfig = require('./config/appconfig');

rethinkdb.connections = [];
rethinkdb.getNewConnection = function () {
  return rethinkdb.connect(appconfig.rethinkdb)
    .then(function (conn) {
      conn.use(appconfig.rethinkdb.db);
      rethinkdb.connections.push(conn);
      return conn;
    });
};

rethinkdb.init(appconfig.rethinkdb, [
  {
    name: 'users',
    indexes: ['createdAt','email']
  }
]).then(function (conn) {
  rethinkdb.conn = conn;
  rethinkdb.connections.push(conn);
  rethinkdb.conn.use(appconfig.rethinkdb.db);
});

module.exports = rethinkdb;