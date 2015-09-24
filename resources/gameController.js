/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import _ from 'lodash'
import { isValid } from '../validator'
import { models } from '../models'
import GameServiceClass from './gameService'

export default (swagger, rethinkdb) => {

  const gameService = new GameServiceClass(rethinkdb)

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
    'action': (req, res) => {
      gameService.list('createdAt')
        .then(results => res.json(results))
    },
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
    'action': (req, res) => {
      const gameID = req.params.id;
      gameService.get(gameID)
        .then(result => res.json(result))
        .catch(error => {
          swagger.errors.notFound('game', res)
        })
    },
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
    'action': (req, res) => {
      if (req.body) {
        if (!isValid(req.body, models.Game)) {
          swagger.errors.invalid('body', res)
          return
        }
      }
      gameService.create(req.body)
        .then(newGame => res.json(newGame))
    },
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
    'action': (req, res) => {
      if (!isValid(req.body, models.Game)) {
        swagger.errors.invalid('body', res)
        return
      }
      const gameID = req.params.id
      gameService.update(gameID, req.body)
        .then(updatedGame => res.json(updatedGame))
        .catch(error => swagger.errors.notFound('game', res))
    },
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
    'action': (req, res) => {
      const gameID = req.params.id
      gameService.delete(gameID)
        .then(() => res.json({success: true}))
        .catch(error => swagger.errors.notFound('game', res))
    },
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
    'action': (req, res) => {
      const gameID = req.params.id;
      gameService.listTrials(gameID)
        .then(result => res.json(result))
        .catch(error => {
          swagger.errors.notFound('game', res)
        })
    },
  })
}
