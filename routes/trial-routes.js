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
  app.route('/trials/all')
    .get(listTrials)           // List all Trials
  app.route('/trials/new')
    .post(createTrial)         // Create a new Trial
    .get(createTrial)
  app.route('/trials/:id')
    .get(getTrial)             // Get a specific Trial
    .put(updateTrial)          // Update a specific Trial
    .delete(deleteTrial)       // Delete a specific Trial
  function listTrials(req, res, next) {
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('trials')
          .orderBy({index: "createdAt"})
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getTrial(req, res, next) {
    let connection = null
    const trialID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('trials')
          .get(trialID)
          .run(conn)
      })
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createTrial(req, res, next) {
    let connection = null
    const trial = {}
    trial.name = req.body.name || "Unnamed Trial"
    trial.game = req.body.game || "Unnamed Game";
    trial.type = req.body.type || "Point"
    trial.description = req.body.description || "A trial description"
    trial.creator = req.body.creator || "Anonymous"
    trial.createdAt = rethinkdb.now()
    trial.lastUpdated = rethinkdb.now()     // Set the field `createdAt` to the current time
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('trials')
          .insert(trial, {returnChanges: true})
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

  function updateTrial(req, res, next) {
    let connection = null
    const trialID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('trials')
          .get(trialID)
          .run(connection)
      })
      .then(result => {
        const trial = {}
        const currentTrial = result
        trial.name = req.body.name || currentTrial.name
        trial.game = req.body.game || currentTrial.game
        trial.type = req.body.type || currentTrial.type
        trial.description = req.body.description || currentTrial.description
        trial.creator = req.body.creator || currentTrial.creator
        trial.lastUpdated = rethinkdb.now()
        return trial
      })
      .then(trial => rethinkdb
        .table('trials')
        .get(trialID)
        .update(trial, {returnChanges: true})
        .run(connection)
      )
      .then(result => res.json(result.changes[0].new_val))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteTrial(req, res, next) {
    let connection = null
    const trialID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('trials')
          .get(trialID)
          .delete()
          .run(connection)
      })
      .then(() => res.json({success: true}))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
