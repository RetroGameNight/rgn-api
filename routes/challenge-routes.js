import appconfig from '../config/appconfig'

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
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('challenges').orderBy({index: "createdAt"}).run(conn, (error, cursor) => {
          if (error) {
              handleError(res, error) 
              next()
          }
          else {
              // Retrieve all the todos in an array
              cursor.toArray((error, result) => {
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
    })
  }

  function getChallenge(req, res, next) {
    const challengeID = req.params.id;
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('challenges').get(challengeID).run(conn, (error, result) => {
        if(error) {
          handleError(res, error) 
          next()
        }
        res.json(result)
      })
    })
  }

  function createChallenge(req, res, next) {
      const challenge = {}
      challenge.trial = req.body.trial || "Unnamed Trial"
      //challenge.goal = req.body.goal || "10000"
      challenge.issuer = req.body.issuer || "Anonymous"
      challenge.player = req.body.player || "Anonymous"
      challenge.challengeStatus = req.body.challengeStatus || "Pending"
      challenge.createdAt = rethinkdb.now()
      challenge.lastUpdated = rethinkdb.now()     // Set the field `createdAt` to the current time
      rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
        rethinkdb.table('challenges').insert(challenge, {returnChanges: true}).run(conn, (error, result) => {
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
      })
  }

  function updateChallenge(req, res, next) {
    const challengeID = req.params.id
    const challenge = {}
    let currentChallenge = {}
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('challenges').get(challengeID).run(conn, (error, result) => {
        if(error) {
          handleError(res, error) 
          next()
        }
        else {
          currentChallenge = result
          challenge.trial = req.body.trial || currentChallenge.trial
          //challenge.goal = req.body.goal || currentChallenge.goal
          challenge.issuer = req.body.issuer || currentChallenge.issuer
          challenge.player = req.body.player || currentChallenge.player
          challenge.challengeStatus = req.body.challengeStatus || currentChallenge.challengeStatus
          challenge.lastUpdated = rethinkdb.now()
          rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
            rethinkdb.table('challenges').get(challengeID).update(challenge, {returnChanges: true}).run(conn, (error, result) => {
              if(error) {
                //handleError(res, error) 
                throw error
                next()
              }
              else {
                res.json(result.changes[0].new_val)
              }
            })
          })
        }
      })
    })
  }

  /*
   * Delete a todo item.
   */
  function deleteChallenge(req, res, next) {
    const challengeID = req.params.id

    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('challenges').get(challengeID).delete().run(conn, (error, result) => {
        if(error) {
          handleError(res, error) 
          next()
        }
        else {
          res.json({success: true})
        }
      })
    })
  }
}
