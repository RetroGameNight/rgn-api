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

export default (swagger, rethinkdb) => {

  swagger.addGet({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/latest",
      "notes" : "Returns a array of score objects",
      "summary" : "List latest scores",
      "method": "GET",
      "parameters" : [],
      "type" : "Score",
      "errorResponses" : [],
      "nickname" : "listLatestScores",
    },
    'action': listLatestScores,
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/all",
      "notes" : "Returns a array of score objects",
      "summary" : "List scores",
      "method": "GET",
      "parameters" : [],
      "type" : "Score",
      "errorResponses" : [],
      "nickname" : "listScores",
    },
    'action': listScores,
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
          "id", 
          "ID of challange that needs to be fetched", 
          "string"
        ),
      ],
      "type" : "Score",
      "errorResponses" : [],
      "nickname" : "getScore",
    },
    'action': getScore,
  })

  swagger.addPost({
    'spec': {
      "description" : "Operations about scores",
      "path" : "/scores/new",
      "notes" : "Returns a new score object",
      "summary" : "Create a new score",
      "method": "POST",
      "parameters" : [],
      "type" : "Score",
      "errorResponses" : [],
      "nickname" : "createScore",
    },
    'action': createScore,
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
          "id", 
          "ID of challange that needs to be updated", 
          "string"
        ),
      ],
      "type" : "Score",
      "errorResponses" : [],
      "nickname" : "updateScore",
    },
    'action': updateScore,
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
          "id", 
          "ID of challange that needs to be deleted", 
          "string"
        ),
      ],
      "type" : "Score",
      "errorResponses" : [],
      "nickname" : "deleteScore",
    },
    'action': deleteScore,
  })

  function listScores(req, res) {
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('scores')
          .orderBy({index: "lastUpdated"})
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function listLatestScores(req, res) {
    let connection = null
    const numScores = parseInt(req.query.scores) || 10
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('scores')
          .orderBy({index: "lastUpdated"})
          .limit(numScores)
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getScore(req, res) {
    let connection = null
    const scoreID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('scores')
          .get(scoreID)
          .run(conn)
      })
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createScore(req, res) {
      const score = {}
      score.user = req.body.user || 'Anonymous'
      score.issuer = req.body.issuer || ''
      score.player = req.body.players || 'Anonymous'
      score.challenge = req.body.challenge || 'Super Mario 10000 Points'
      score.status = req.body.status || 'Open'
      score.result = req.body.score || ''
      score.createdAt = rethinkdb.now()
      score.lastUpdated = rethinkdb.now()     // Set the field `createdAt` to the current time
      let connection = null
      rethinkdb.connect(appconfig.rethinkdb)
        .then(conn => {
          connection = conn
          return rethinkdb
            .table('scores')
            .insert(score, {returnChanges: true})
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

  function updateScore(req, res) {
    let connection = null
    const scoreID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('scores')
          .get(scoreID)
          .run(connection)
      })
      .then(result => {
        const score = {}
        const currentScore = result
        score.user = req.body.user || currentScore.user
        score.issuer = req.body.issuer || currentScore.issuer
        score.player = req.body.player || currentScore.player
        score.challenge = req.body.challenge || currentScore.challenge
        score.status = req.body.status || currentScore.status
        score.result = req.body.result || currentScore.result
        score.lastUpdated = rethinkdb.now()
        return score
      })
      .then(score => rethinkdb
        .table('scores')
        .get(scoreID)
        .update(score, {returnChanges: true})
        .run(connection)
      )
      .then(result => res.json(result.changes[0].new_val))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteScore(req, res) {
    let connection = null
    const scoreID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('scores')
          .get(scoreID)
          .delete()
          .run(connection)
      })
      .then(() => res.json({success: true}))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
