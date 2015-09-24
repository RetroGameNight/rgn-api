/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Service from './service'

export default class GameService extends Service {
  constructor(rethinkdb) {
    super(
      rethinkdb, 
      'games', 
      {
        name: "Unnamed Game",
        system: "Unnamed System",
        avatarURL: "",
      }
    )
  }
  listTrials(id){
    return this.connection(connection => {
      return this.rethinkdb
        .table('trials')
        .filter({'game':id}) 
        .run(connection)
        .then(cursor => cursor.toArray())
    })
  }
}
