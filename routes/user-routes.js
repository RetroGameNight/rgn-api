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

module.exports = function (app, rethinkdb) {
  app.route('/users/all')
    .get(listUsers)           // List all users
  app.route('/users/new')
    .post(createUser)         // Create a new user
    .get(createUser)
  app.route('/users/:id')
    .get(getUser)             // Get a specific user
    .put(updateUser)          // Update a specific user
    .delete(deleteUser)       // Delete a specific user

  function listUsers(req, res, next) {
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('users')
          .orderBy({index: "createdAt"})
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getUser(req, res, next) {
    let connection = null
    const userID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('users')
          .get(userID)
          .run(conn)
      })
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createUser(req, res, next) {
    let connection = null
    const user = {}
    user.name = req.body.name || "Anonymous"
    user.email = req.body.email || "Anonymous"
    user.avatarURL = req.body.avatarURL || ""
    user.type = req.body.type || "other"         // req.body was created by `bodyParser`
    user.createdAt = rethinkdb.now()
    user.lastUpdated = rethinkdb.now()    // Set the field `createdAt` to the current time
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('users')
          .insert(user, {returnChanges: true})
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

  function updateUser(req, res, next) {
    const userID = req.params.id
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('users')
          .get(userID)
          .run(connection)
      })
      .then(result => {
        const user = {}
        const currentUser = result
        user.name = req.body.name || currentUser.name
        user.email = req.body.email || currentUser.email
        user.avatarURL = req.body.avatarURL || currentUser.avatarURL
        user.type = req.body.type || currentUser.type         // req.body was created by `bodyParser`
        user.lastUpdated = rethinkdb.now()
        return user
      })
      .then(user => rethinkdb
        .table('users')
        .get(userID)
        .update(user, {returnChanges: true})
        .run(connection)
      )
      .then(result => res.json(result.changes[0].new_val))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteUser(req, res, next) {
    let connection = null
    const userID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('users')
          .get(userID)
          .delete()
          .run(connection)
      })
      .then(() => res.json({success: true}))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
