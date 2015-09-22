/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
import swaggerValidate from 'swagger-validate'
import appconfig from '../config/appconfig'
import { models } from '../models'

function handleError(res, error) {
  console.log("error", error)
}

export default (swagger, rethinkdb) => {

  swagger.addGet({
    'spec': {
      "description" : "Operations about users",
      "path" : "/users/all",
      "notes" : "Returns a array of user objects",
      "summary" : "List users",
      "method": "GET",
      "parameters" : [],
      "type" : "List[User]",
      "responseMessages" : [],
      "nickname" : "listUsers",
    },
    'action': listUsers,
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about users",
      "path" : "/users/{id}",
      "notes" : "Returns an user object",
      "summary" : "Get user by id",
      "method": "GET",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of user that needs to be fetched", "string"),
      ],
      "type" : "User",
      "responseMessages" : [
        swagger.errors.notFound('user'),
      ],
      "nickname" : "getUser",
    },
    'action': getUser,
  })

  swagger.addPost({
    'spec': {
      "description" : "Operations about users",
      "path" : "/users/new",
      "notes" : "Returns a new user object",
      "summary" : "Create a new user",
      "method": "POST",
      "parameters" : [
        swagger.bodyParam(
          "user", "new User", "User"),
      ],
      "type" : "User",
      "responseMessages" : [
        swagger.errors.invalid('body'),
      ],
      "nickname" : "createUser",
    },
    'action': createUser,
  })

  swagger.addPut({
    'spec': {
      "description" : "Operations about users",
      "path" : "/users/{id}",
      "notes" : "Returns the updated user object",
      "summary" : "Update an users",
      "method": "PUT",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of user that needs to be updated", "string"),
        swagger.bodyParam(
          "user", "new User", "User"),
      ],
      "type" : "User",
      "responseMessages" : [
        swagger.errors.invalid('body'),
        swagger.errors.notFound('user'),
      ],
      "nickname" : "updateUser",
    },
    'action': updateUser,
  })

  swagger.addDelete({
    'spec': {
      "description" : "Operations about users",
      "path" : "/users/{id}",
      "notes" : "Returns a status object",
      "summary" : "Deletes an user",
      "method": "DELETE",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of user that needs to be deleted", "string"),
      ],
      "type" : "User",
      "responseMessages" : [
        swagger.errors.notFound('user'),
      ],
      "nickname" : "deleteUser",
    },
    'action': deleteUser,
  })

  function listUsers(req, res) {
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

  function getUser(req, res) {
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

  function createUser(req, res) {
    if (req.body) {
      const validationErrors = swaggerValidate.model(req.body, models.User)
      if (validationErrors) {
        swagger.errors.invalid('body', res)
        return
      }
    }
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

  function updateUser(req, res) {
    const validationErrors = swaggerValidate.model(req.body, models.User)
    if (validationErrors) {
      swagger.errors.invalid('body', res)
      return
    }
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
  function deleteUser(req, res) {
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
