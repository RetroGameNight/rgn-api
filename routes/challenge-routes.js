/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
"use strict"

import appconfig from '../config/appconfig'

function handleError(res, error) {
  console.log("error", error)
}

export default (app, rethinkdb) => {
  app.route('/challenges/all')
    .get(listChallenges)           // List all challenges
  app.route('/challenges/new')
    .post(createChallenge)         // Create a new challenge
    .get(createChallenge)
  app.route('/challenges/:id')
    .get(getChallenge)             // Get a specific challenge
    .put(updateChallenge)          // Update a specific challenge
    .delete(deleteChallenge)       // Delete a specific challenge

  function listChallenges(req, res, next) {
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('challenges')
          .orderBy({index: "createdAt"})
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getChallenge(req, res, next) {
    let connection = null
    const challengeID = req.params.id;
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('challenges')
          .get(challengeID)
          .run(conn)
      })
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createChallenge(req, res, next) {
      let connection = null
      const challenge = {}
      challenge.trial = req.body.trial || "Unnamed Trial"
      //challenge.goal = req.body.goal || "10000"
      challenge.issuer = req.body.issuer || "Anonymous"
      challenge.player = req.body.player || "Anonymous"
      challenge.challengeStatus = req.body.challengeStatus || "Pending"
      challenge.createdAt = rethinkdb.now()
      challenge.lastUpdated = rethinkdb.now()     // Set the field `createdAt` to the current time
      rethinkdb.connect(appconfig.rethinkdb)
        .then(conn => {
          connection = conn
          return rethinkdb
            .table('challenges')
            .insert(challenge, {returnChanges: true})
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

  function updateChallenge(req, res, next) {
    const challengeID = req.params.id
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('challenges')
          .get(challengeID)
          .run(connection)
      })
      .then(result => {
        const challenge = {}
        const currentChallenge = result
        challenge.trial = req.body.trial || currentChallenge.trial
        //challenge.goal = req.body.goal || currentChallenge.goal
        challenge.issuer = req.body.issuer || currentChallenge.issuer
        challenge.player = req.body.player || currentChallenge.player
        challenge.challengeStatus = req.body.challengeStatus || currentChallenge.challengeStatus
        challenge.lastUpdated = rethinkdb.now()
        return challenge
      })
      .then(challenge => rethinkdb
        .table('challenges')
        .get(challengeID)
        .update(challenge, {returnChanges: true})
        .run(connection)
      )
      .then(result => res.json(result.changes[0].new_val))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteChallenge(req, res, next) {
    const challengeID = req.params.id
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('challenges')
          .get(challengeID)
          .delete()
          .run(connection)
      })
      .then(() => res.json({success: true}))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
