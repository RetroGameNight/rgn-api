/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import _ from 'lodash'
import swaggerValidate from 'swagger-validate'
import appconfig from '../config/appconfig'
import { models } from '../models'

function handleError(res, error) {
  console.log("error", error)
}

export default (swagger, rethinkdb) => {

  swagger.addGet({
    'spec': {
      "description" : "Operations about games",
      "path" : "/games/all",
      "notes" : "Returns a array of game objects",
      "summary" : "List games",
      "method": "GET",
      "parameters" : [],
      "type" : "List[Game]",
      "responseMessages" : [],
      "nickname" : "listGames",
    },
    'action': listGames,
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about games",
      "path" : "/games/{id}",
      "notes" : "Returns a game object",
      "summary" : "Get game by id",
      "method": "GET",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of game that needs to be fetched", "string"
        ),
      ],
      "type" : "Game",
      "responseMessages" : [
        swagger.errors.notFound('game'),
      ],
      "nickname" : "getGame",
    },
    'action': getGame,
  })

  swagger.addPost({
    'spec': {
      "description" : "Operations about games",
      "path" : "/games/new",
      "notes" : "Returns a new game object",
      "summary" : "Create a new game",
      "method": "POST",
      "parameters" : [
        swagger.bodyParam(
          "game", "new Game", "Game"),
      ],
      "type" : "Game",
      "responseMessages" : [
        swagger.errors.invalid('body'),
      ],
      "nickname" : "createGame",
    },
    'action': createGame,
  })

  swagger.addPut({
    'spec': {
      "description" : "Operations about games",
      "path" : "/games/{id}",
      "notes" : "Returns the updated game object",
      "summary" : "Update a game",
      "method": "PUT",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of game that needs to be updated", "string"),
        swagger.bodyParam(
          "game", "new Game", "Game"),
      ],
      "type" : "Game",
      "responseMessages" : [
        swagger.errors.invalid('body'),
        swagger.errors.notFound('game'),
      ],
      "nickname" : "updateGame",
    },
    'action': updateGame,
  })

  swagger.addDelete({
    'spec': {
      "description" : "Operations about games",
      "path" : "/games/{id}",
      "notes" : "Returns a status object",
      "summary" : "Deletes a game",
      "method": "DELETE",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of game that needs to be deleted", "string"),
      ],
      "type" : "Game",
      "responseMessages" : [],
      "nickname" : "deleteGame",
    },
    'action': deleteGame,
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about games",
      "path" : "/games/{id}/trials",
      "notes" : "Returns a array of trial objects",
      "summary" : "List trials for game",
      "method": "GET",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of game to list trials for", "string"
        ),
      ],
      "type" : "Trial",
      "responseMessages" : [
        swagger.errors.notFound('game'),
      ],
      "nickname" : "listTrialsForGame",
    },
    'action': listTrialsForGame,
  })

  function listGames(req, res) {
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

  function getGame(req, res) {
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
      .then(results => {
        if (results) {
          res.json(results)
        } else {
          swagger.errors.notFound('game', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createGame(req, res) {
    if (req.body) {
      const validationErrors = swaggerValidate.model(req.body, models.Game)
      if (validationErrors) {
        swagger.errors.invalid('body', res)
        return
      }
    }
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

  function updateGame(req, res) {
    const validationErrors = swaggerValidate.model(req.body, models.Game)
    if (validationErrors) {
      swagger.errors.invalid('body', res)
      return
    }
    let connection = null
    const gameID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('games')
          .get(gameID)
          .update(_.merge(req.body, {
            lastUpdated: rethinkdb.now(),
          }),{
            returnChanges: true
          })
          .run(connection)
      })
      .then(result => res.json(result.changes[0].new_val))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteGame(req, res) {
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
      .then(status => {
        if (status.deleted == 1) {
          res.json({success: true})
        } else {
          swagger.errors.notFound('game', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function listTrialsForGame(req, res){
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
