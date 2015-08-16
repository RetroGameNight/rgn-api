/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
import rethinkdb from 'rethinkdb'
require('rethinkdb-init')(rethinkdb);
import appconfig from './config/appconfig'

rethinkdb.connections = []
/*rethinkdb.getNewConnection = function () {
  return rethinkdb.connect(appconfig.rethinkdb)
    .then(function (conn) {
      conn.use(appconfig.rethinkdb.db);
      rethinkdb.connections.push(conn);
      return conn;
    });
};*/

rethinkdb.init(appconfig.rethinkdb, [
  {
    name: 'users',
    indexes: ['createdAt','email'],
  },
  {
    name: 'events',
    indexes: ['startTime'],
  },
  {
    name: 'games',
    indexes: ['createdAt'],
  },
  {
    name: 'trials',
    indexes: ['createdAt','game'],
  },
  {
    name: 'challenges',
    indexes: ['createdAt','game'],
  },
  {
    name: 'scores',
    indexes: ['lastUpdated','challenge'],
  },
]).then(conn => {
  rethinkdb.conn = conn
  rethinkdb.connections.push(conn)
  rethinkdb.conn.use(appconfig.rethinkdb.db)
})

module.exports = rethinkdb