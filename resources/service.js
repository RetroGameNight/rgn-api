/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import _ from 'lodash'
import appconfig from '../config/appconfig'

export default class {
  constructor(rethinkdb, tableName, defaults) {
    this.rethinkdb = rethinkdb
    this.tableName = tableName
    this.defaults = defaults
  }
  connection(func) {
    let connection = null 
    return this.rethinkdb.connect(appconfig.rethinkdb)
      .then(newConnection => {
        connection = newConnection
        return connection
      })
      .then(connection => func(connection))
      .then(funcResult => {
        connection.close()
        return funcResult
      }) 
  }
  list(orderBy) {
    return this.connection(connection => {
      return this.rethinkdb
        .table(this.tableName)
        .orderBy(orderBy)
        .run(connection)
        .then(cursor => cursor.toArray())
    })
  }
  get(id) {
    return this.connection(connection => {
      return this.rethinkdb
        .table(this.tableName)
        .get(id)
        .run(connection)
        .then(result => {
          if (!result) {
            throw new Error('NotFound')
          }
          return result
        })
    })
  }
  create(changes) {
    const newObject = _.defaults(changes, this.defaults)
    const now = this.rethinkdb.now()
    return this.connection(connection => {
      return this.rethinkdb
        .table(this.tableName)
        .insert(_.merge(newObject, {
          lastUpdated: now,
          createdAt: now,
        }), {
          returnChanges: true,
        })
        .run(connection)
        .then(changes => {
          if (changes.inserted !== 1) {
              throw new Error("Document was not inserted.")
          }
          return changes.changes[0].new_val
        })
    })
  }
  update(id, changes) {
    return this.connection(connection => {
      return this.rethinkdb
        .table(this.tableName)
        .get(id)
        .update(_.merge(changes, {
          lastUpdated: this.rethinkdb.now(),
        }), {
          returnChanges: true,
        })
        .run(connection)
        .then(result => {
          if (result.replaced > 0) {
            return result.changes[0].new_val
          } else {
            throw new Error('NotFound')
          }
        })
    })
  }
  delete(id) {
    return this.connection(connection => {
      return this.rethinkdb
        .table(this.tableName)
        .get(id)
        .delete()
        .run(connection)
        .then(status => {
          if (status.deleted != 1) {
            throw new Error('NotFound')
          }
        })
    })
  }
}