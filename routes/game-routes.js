/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
import appconfig from '../config/appconfig'

function handleError(res, error) {
  console.log("error", error)
}

export default (app, rethinkdb) => {
  app.route('/games/all')
    .get(listGames)           // List all games
  app.route('/games/new')
    .post(createGame)         // Create a new game
    .get(createGame)
  app.route('/games/:id')
    .get(getGame)             // Get a specific game
    .put(updateGame)          // Update a specific game
    .delete(deleteGame)       // Delete a specific game

  app.route('/games/:id/trials')
    .get(getTrialsForGame)             // Get a specific game

  function listGames(req, res, next) {
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('games')
          .orderBy({index: "createdAt"})
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getGame(req, res, next) {
    let connection = null
    const gameID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('games')
          .get(gameID)
          .run(conn)
      })
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createGame(req, res, next) {
    let connection = null
    const game = {}
    game.name = req.body.name || "Unnamed Game"
    game.system = req.body.system || "Unnamed System"
    game.avatarURL = req.body.avatarURL || ""
    game.createdAt = rethinkdb.now()
    game.lastUpdated = rethinkdb.now()     // Set the field `createdAt` to the current time
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('games')
          .insert(game, {returnChanges: true})
          .run(connection)
      })
      .then(result => {
        if (result.inserted !== 1) {
            handleError(res, new Error("Document was not inserted."))
        } else {
            return res.json(result.changes[0].new_val)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function updateGame(req, res, next) {
    let connection = null
    const gameID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('games')
          .get(gameID)
          .run(connection)
      })
      .then(result => {
        const game = {}
        const currentgame = result
        game.name = req.body.name || currentgame.name
        game.avatarURL = req.body.avatarURL || currentgame.avatarURL
        game.system = req.body.system || currentgame.system         // req.body was created by `bodyParser`
        game.lastUpdated = rethinkdb.now()
        return game
      })
      .then(game => rethinkdb
        .table('games')
        .get(gameID)
        .update(game, {returnChanges: true})
        .run(connection)
      )
      .then(result => res.json(result.changes[0].new_val))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteGame(req, res, next) {
    let connection = null
    const gameID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('games')
          .get(gameID)
          .delete()
          .run(connection)
      })
      .then(() => res.json({success: true}))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getTrialsForGame(req, res, next){
    let connection = null
    const gameID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('trials')
          .filter({'game':gameID}) 
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
