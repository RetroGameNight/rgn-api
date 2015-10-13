/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Service from './service'

export default class ScoreService extends Service {
  constructor(rethinkdb) {
    super(
      rethinkdb, 
      'scores', 
      {
        creator: "",
        player: "",
        trial: "",
        values: {},
      }
    )
  }
  listLatest(limit, orderBy) {
    return this.connection(connection => {
      return this.rethinkdb 
        .table(this.tableName)
        .orderBy({index: orderBy})
        .limit(limit)
        .run(connection)
        .then(cursor => cursor.toArray())
    })
  }
}
