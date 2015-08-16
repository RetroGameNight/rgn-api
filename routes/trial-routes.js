/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
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
      rethinkdb.table('trials').orderBy({index: "createdAt"}).run(rethinkdb.conn, (error, cursor) => {
          if (error) {
              handleError(res, error) 
              next()
          }
          else {
              // Retrieve all the todos in an array
              cursor.toArray(function(error, result) {
                  if (error) {
                      handleError(res, error) 
                  }
                  else {
                      // Send back the data
                      res.json(result)
                  }
              })
          }
      })
  }

  function getTrial(req, res, next) {
    const trialID = req.params.id
    rethinkdb.table('trials').get(trialID).run(rethinkdb.conn, (error, result) => {
      if(error) {
        handleError(res, error) 
        next()
      }
      res.json(result)
    })
  }

  function createTrial(req, res, next) {
      const trial = {}
      trial.name = req.body.name || "Unnamed Trial"
      trial.game = req.body.game || "Unnamed Game";
      trial.type = req.body.type || "Point"
      trial.description = req.body.description || "A trial description"
      trial.creator = req.body.creator || "Anonymous"
      trial.createdAt = rethinkdb.now()
      trial.lastUpdated = rethinkdb.now()     // Set the field `createdAt` to the current time
      rethinkdb.table('trials').insert(trial, {returnChanges: true}).run(rethinkdb.conn, (error, result) => {
          if (error) {
              handleError(res, error) 
              next()
          }
          else if (result.inserted !== 1) {
              handleError(res, new Error("Document was not inserted."))
              next()
          }
          else {
              res.json(result.changes[0].new_val)
          }
      })
  }

  function updateTrial(req, res, next) {
    const trialID = req.params.id
    const trial = {}
    let currentTrial = {}
    rethinkdb.table('trials').get(trialID).run(rethinkdb.conn, (error, result) => {
      if(error) {
        handleError(res, error) 
        next()
      }
      else {
        currentTrial = result
        trial.name = req.body.name || currentTrial.name
        trial.game = req.body.game || currentTrial.game
        trial.type = req.body.type || currentTrial.type
        trial.description = req.body.description || currentTrial.description
        trial.creator = req.body.creator || currentTrial.creator
        trial.lastUpdated = rethinkdb.now()
        rethinkdb.table('trials').get(trialID).update(trial, {returnChanges: true}).run(rethinkdb.conn, (error, result) => {
          if(error) {
            //handleError(res, error) 
            throw error
            next()
          }
          else {
            res.json(result.changes[0].new_val)
          }
        })
      }
    })
  }

  /*
   * Delete a todo item.
   */
  function deleteTrial(req, res, next) {
    const trialID = req.params.id

    rethinkdb.table('trials').get(trialID).delete().run(rethinkdb.conn, (error, result) => {
      if(error) {
        handleError(res, error) 
        next()
      }
      else {
        res.json({success: true})
      }
    })
  }
}
