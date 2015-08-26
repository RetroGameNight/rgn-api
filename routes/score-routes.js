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
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('scores').orderBy({index: "lastUpdated"}).run(conn, (error, cursor) => {
          if (error) {
              res.send(error) 
              next()
          }
          else {
              // Retrieve all the todos in an array
              cursor.toArray((error, result) => {
                  if (error) {
                      res.send(error) 
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
  function listRecentScores(req, res, next) {
      const numScores = parseInt(req.query.scores) || 10
      rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
        rethinkdb.table('scores').orderBy({index: "lastUpdated"}).limit(numScores).run(conn, (error, cursor) => {
            if (error) {
                res.send(error) 
                next()
            }
            else {
                // Retrieve all the todos in an array
                cursor.toArray((error, result) => {
                    if (error) {
                        res.send(error) 
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

  function getScore(req, res, next) {
    const scoreID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('scores').get(scoreID).run(conn, (error, result) => {
        if(error) {
          res.send(error) 
          next()
        }
        res.json(result)
      })
    })
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
      rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
        rethinkdb.table('scores').insert(score, {returnChanges: true}).run(conn, (error, result) => {
            if (error) {
                res.send(error) 
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

  function updateScore(req, res, next) {
    const scoreID = req.params.id
    const score = {}
    let currentScore = {}
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('scores').get(scoreID).run(conn, (error, result) => {
        if(error) {
          res.send(error) 
          next()
        }
        else {
          currentScore = result
          score.user = req.body.user || currentScore.user
          score.issuer = req.body.issuer || currentScore.issuer
          score.player = req.body.player || currentScore.player
          score.challenge = req.body.challenge || currentScore.challenge
          score.status = req.body.status || currentScore.status
          score.result = req.body.result || currentScore.result
          score.lastUpdated = rethinkdb.now()
          rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
            rethinkdb.table('scores').get(scoreID).update(score, {returnChanges: true}).run(conn, (error, result) => {
              if(error) {
                //res.send(error) 
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
  function deleteScore(req, res, next) {
    const scoreID = req.params.id

    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('scores').get(scoreID).delete().run(conn, (error, result) => {
        if(error) {
          res.send(error) 
          next()
        }
        else {
          res.json({success: true})
        }
      })
    })
  }
}
