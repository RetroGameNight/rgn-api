/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Service from './service'

export default class TrialService extends Service {
  constructor(rethinkdb) {
    super(
      rethinkdb, 
      'trials', 
      {
        name: "Unnamed Trial",
        game: "Unnamed Game",
        type: "Point",
        description: "A trial description",
        creator: "Anonymous",
      }
    )
  }
}
