/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { isValid } from '../validator'
import { models } from '../models'
import ScoreServiceClass from './scoreService'

export default (swagger, rethinkdb) => {

  const scoreService = new ScoreServiceClass(rethinkdb)

  swagger.addGet({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/latest",
      "notes" : "Returns a array of score objects",
      "summary" : "List latest scores",
      "method": "GET",
      "parameters" : [],
      "type" : "List[Score]",
      "responseMessages" : [],
      "nickname" : "listLatestScores",
    },
    'action': (req, res) => {
      const limit = parseInt(req.query.scores) || 10
      scoreService.listLatest(limit, 'lastUpdated')
        .then(results => res.json(results))
    },
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/all",
      "notes" : "Returns a array of score objects",
      "summary" : "List scores",
      "method": "GET",
      "parameters" : [],
      "type" : "List[Score]",
      "responseMessages" : [],
      "nickname" : "listScores",
    },
    'action': (req, res) => {
      scoreService.list('lastUpdated')
        .then(results => res.json(results))
    },
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/{id}",
      "notes" : "Returns a score object",
      "summary" : "Get score by id",
      "method": "GET",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of challange that needs to be fetched", "string"),
      ],
      "type" : "Score",
      "responseMessages" : [
        swagger.errors.notFound('score'),
      ],
      "nickname" : "getScore",
    },
    'action': (req, res) => {
      const scoreID = req.params.id;
      scoreService.get(scoreID)
        .then(result => res.json(result))
        .catch(error => {
          swagger.errors.notFound('score', res)
        })
    },
  })

  swagger.addPost({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/new",
      "notes" : "Returns a new score object",
      "summary" : "Create a new score",
      "method": "POST",
      "parameters" : [
        swagger.bodyParam(
          "score", "new Score", "Score"),
      ],
      "type" : "Score",
      "responseMessages" : [
        swagger.errors.invalid('body'),
      ],
      "nickname" : "createScore",
    },
    'action': (req, res) => {
      if (req.body) {
        if (!isValid(req.body, models.Score)) {
          swagger.errors.invalid('body', res)
          return
        }
      }
      scoreService.create(req.body)
        .then(newScore => res.json(newScore))
    },
  })

  swagger.addPut({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/{id}",
      "notes" : "Returns the updated score object",
      "summary" : "Update a scores",
      "method": "PUT",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of challange that needs to be updated", "string"),
        swagger.bodyParam(
          "score", "new Score", "Score"),
      ],
      "type" : "Score",
      "responseMessages" : [
        swagger.errors.invalid('body'),
        swagger.errors.notFound('score'),
      ],
      "nickname" : "updateScore",
    },
    'action': (req, res) => {
      if (!isValid(req.body, models.Score)) {
        swagger.errors.invalid('body', res)
        return
      }
      const scoreID = req.params.id
      scoreService.update(scoreID, req.body)
        .then(updatedScore => res.json(updatedScore))
        .catch(error => swagger.errors.notFound('score', res))
    },
  })

  swagger.addDelete({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/{id}",
      "notes" : "Returns a status object",
      "summary" : "Deletes a score",
      "method": "DELETE",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of challange that needs to be deleted", "string"),
      ],
      "type" : "Score",
      "responseMessages" : [
        swagger.errors.notFound('score'),
      ],
      "nickname" : "deleteScore",
    },
    'action': (req, res) => {
      const scoreID = req.params.id
      scoreService.delete(scoreID)
        .then(() => res.json({success: true}))
        .catch(error => swagger.errors.notFound('score', res))
    },
  })
}
