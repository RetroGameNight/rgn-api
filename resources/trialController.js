/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
import _ from 'lodash' 
import { isValid } from '../validator'
import appconfig from '../config/appconfig'
import { models } from '../models'

function handleError(res, error) {
  console.log("error", error)
}

export default (swagger, rethinkdb) => {

  swagger.addGet({
    'spec': {
      "description" : "Operations about trials",
      "path" : "/trials/all",
      "notes" : "Returns a array of trial objects",
      "summary" : "List trials",
      "method": "GET",
      "parameters" : [],
      "type" : "List[Trial]",
      "responseMessages" : [],
      "nickname" : "listTrials",
    },
    'action': listTrials,
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about trials",
      "path" : "/trials/{id}",
      "notes" : "Returns a trial object",
      "summary" : "Get trial by id",
      "method": "GET",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of trial that needs to be fetched", "string"),
      ],
      "type" : "Trial",
      "responseMessages" : [
        swagger.errors.notFound('trial'),
      ],
      "nickname" : "getTrial",
    },
    'action': getTrial,
  })

  swagger.addPost({
    'spec': {
      "description" : "Operations about trials",
      "path" : "/trials/new",
      "notes" : "Returns a new trial object",
      "summary" : "Create a new trial",
      "method": "POST",
      "parameters" : [
        swagger.bodyParam(
          "trial", "new Trial", "Trial"),
      ],
      "type" : "Trial",
      "responseMessages" : [
        swagger.errors.invalid('body'),
      ],
      "nickname" : "createTrial",
    },
    'action': createTrial,
  })

  swagger.addPut({
    'spec': {
      "description" : "Operations about trials",
      "path" : "/trials/{id}",
      "notes" : "Returns the updated trial object",
      "summary" : "Update a trial",
      "method": "PUT",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of trial that needs to be updated", "string"),
        swagger.bodyParam(
          "trial", "new Trial", "Trial"),
      ],
      "type" : "Trial",
      "responseMessages" : [
        swagger.errors.invalid('body'),
        swagger.errors.notFound('trial'),
      ],
      "nickname" : "updateTrial",
    },
    'action': updateTrial,
  })

  swagger.addDelete({
    'spec': {
      "description" : "Operations about trials",
      "path" : "/trials/{id}",
      "notes" : "Returns a status object",
      "summary" : "Deletes a trial",
      "method": "DELETE",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of trial that needs to be deleted", "string"
        ),
      ],
      "type" : "Trial",
      "responseMessages" : [
        swagger.errors.notFound('trial'),
      ],
      "nickname" : "deleteTrial",
    },
    'action': deleteTrial,
  })

  function listTrials(req, res) {
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

  function getTrial(req, res) {
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
      .then(results => {
        if (results) {
          res.json(results)
        } else {
          swagger.errors.notFound('trial', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createTrial(req, res) {
    if (req.body) {
      if (!isValid(req.body, models.Trial)) {
        swagger.errors.invalid('body', res)
        return
      }
    }
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

  function updateTrial(req, res) {
    if (!isValid(req.body, models.Trial)) {
      swagger.errors.invalid('body', res)
      return
    }
    let connection = null
    const trialID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('trials')
          .get(trialID)
          .update(_.merge(req.body, {
            lastUpdated: rethinkdb.now(),
          }),{
            returnChanges: true
          })
          .run(connection)
      })
      .then(result => {
        if (result.replaced > 0) {
          res.json(result.changes[0].new_val)
        } else {
          swagger.errors.notFound('trial', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteTrial(req, res) {
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
      .then(status => {
        if (status.deleted == 1) {
          res.json({success: true})
        } else {
          swagger.errors.notFound('trial', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
