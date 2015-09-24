/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import _ from 'lodash' 
import { isValid } from '../validator'
import { models } from '../models'
import UserServiceClass from './userService'

export default (swagger, rethinkdb) => {

  const userService = new UserServiceClass(rethinkdb)

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
    'action': (req, res) => {
      userService.list('createdAt')
        .then(results => res.json(results))
    },
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
    'action': (req, res) => {
      const userID = req.params.id;
      userService.get(userID)
        .then(result => res.json(result))
        .catch(error => {
          swagger.errors.notFound('user', res)
        })
    },
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
    'action': (req, res) => {
      if (req.body) {
        if (!isValid(req.body, models.User)) {
          swagger.errors.invalid('body', res)
          return
        }
      }
      userService.create(req.body)
        .then(newService => res.json(newService))
    },
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
    'action': (req, res) => {
      if (!isValid(req.body, models.User)) {
        swagger.errors.invalid('body', res)
        return
      }
      const userID = req.params.id
      userService.update(userID, req.body)
        .then(updatedUser => res.json(updatedUser))
        .catch(error => swagger.errors.notFound('user', res))
    },
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
    'action': (req, res) => {
      const userID = req.params.id
      userService.delete(userID)
        .then(() => res.json({success: true}))
        .catch(error => swagger.errors.notFound('user', res))
    },
  })
}
