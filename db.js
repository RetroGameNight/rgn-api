/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
import rethinkdb from 'rethinkdb'
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

rethinkdbInit([
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
])


function rethinkdbInit(tables) {
  let connection = null
  let promise = rethinkdb.connect(appconfig.rethinkdb)
  promise = promise
    .then(conn => connection = conn )
    .then(result => {
      return rethinkdb.dbCreate(appconfig.rethinkdb.db).run(connection)
    })
  tables.forEach(eachTable => {
    promise = promise
      .then(result => rethinkdb
          .db(appconfig.rethinkdb.db)
          .tableCreate(eachTable.name)
          .run(connection)
      )
    eachTable.indexes.forEach(eachIndex => {
      promise = promise
        .then(result => rethinkdb
            .table(eachTable.name)
            .indexCreate(eachIndex)
            .run(connection)
        )
    })
  })
  promise = promise.then(result => connection.close())
  promise = promise.error(error => console.log(error))
}
