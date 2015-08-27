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
  app.route('/games/all')
    .get(listGames)           // List all games
  app.route('/games/new')
    .post(createGame)         // Create a new game
    .get(createGame)
  app.route('/games/:id')
    .get(getGame)             // Get a specific game
    .put(updateGame)          // Update a specific game
    .delete(deleteGame)       // Delete a specific game

  app.route('/games/:id/trials')
    .get(getTrialsForGame)             // Get a specific game

  function listGames(req, res, next) {
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('games').orderBy({index: "createdAt"}).run(conn, (error, cursor) => {
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

  function getGame(req, res, next) {
    const gameID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('games').get(gameID).run(conn, (error, result) => {
        if(error) {
          handleError(res, error) 
          next()
        }
        res.json(result)
      })
    })
  }

  function createGame(req, res, next) {
      const game = {}
      game.name = req.body.name || "Unnamed Game"
      game.system = req.body.system || "Unnamed System"
      game.avatarURL = req.body.avatarURL || ""
      game.createdAt = rethinkdb.now()
      game.lastUpdated = rethinkdb.now()     // Set the field `createdAt` to the current time
      rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
        rethinkdb.table('games').insert(game, {returnChanges: true}).run(conn, (error, result) => {
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

  function updateGame(req, res, next) {
    const gameID = req.params.id
    const game = {}
    let currentgame = {}
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('games').get(gameID).run(conn, (error, result) => {
        if(error) {
          handleError(res, error) 
          next()
        }
        else {
          currentgame = result
          game.name = req.body.name || currentgame.name
          game.avatarURL = req.body.avatarURL || currentgame.avatarURL
          game.system = req.body.system || currentgame.system         // req.body was created by `bodyParser`
          game.lastUpdated = rethinkdb.now()
          rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
            rethinkdb.table('games').get(gameID).update(game, {returnChanges: true}).run(conn, (error, result) => {
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
  function deleteGame(req, res, next) {
    const gameID = req.params.id

    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('games').get(gameID).delete().run(conn, (error, result) => {
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

  function getTrialsForGame(req, res, next){
    const gameID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
      rethinkdb.table('trials').filter({'game':gameID}).run(conn, (error, cursor) => {
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
}
