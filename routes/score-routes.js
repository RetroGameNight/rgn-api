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
  app.route('/scores/latest')
    .get(listRecentScores)
  app.route('/scores/all')
    .get(listScores)
  app.route('/scores/new')
    .post(createScore)         // Create a new score
    .get(createScore)
  app.route('/scores/:id')
    .get(getScore)             // Get a specific score
    .put(updateScore)          // Update a specific score
    .delete(deleteScore)       // Delete a specific score

  function listScores(req, res, next) {
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
  function listRecentScores(req, res, next) {
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

  function getScore(req, res, next) {
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

  function createScore(req, res, next) {
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

  function updateScore(req, res, next) {
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
  function deleteScore(req, res, next) {
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
