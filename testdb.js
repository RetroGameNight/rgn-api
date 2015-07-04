var rethinkdb = require('rethinkdb');
require('rethinkdb-init')(rethinkdb);
var appconfig = require('./config/testappconfig');

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
  },
  {
    name: 'events',
    indexes: ['startTime']
  },
  {
    name: 'games',
    indexes: ['name']
  },
  {
    name: 'challenges',
    indexes: ['game']
  },
  {
    name: 'records',
    indexes: ['user']
  } 
]).then(function (conn) {
  rethinkdb.conn = conn;
  rethinkdb.connections.push(conn);
  rethinkdb.conn.use(appconfig.rethinkdb.db);
});

module.exports = rethinkdb;