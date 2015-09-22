/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
"use strict"

import swaggerValidate from 'swagger-validate'
import appconfig from '../config/appconfig'
import { models } from '../models'

//const Challenge = models.Challenge

function handleError(res, error) {
  console.log("error", error)
}

export default (swagger, rethinkdb) => {

  swagger.addGet({
    'spec': {
      "description" : "Operations about challenges",
      "path" : "/challenges/all",
      "notes" : "Returns a array of challenge objects",
      "summary" : "List challenges",
      "method": "GET",
      "parameters" : [],
      "type" : "List[Challenge]",
      "produces" : ["application/json"],
      "responseMessages" : [],
      "nickname" : "listChallenges",
    },
    'action': listChallenges,
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about challenges",
      "path" : "/challenges/{id}",
      "notes" : "Returns a challenge object",
      "summary" : "Get challenge by id",
      "method": "GET",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of challange that needs to be fetched", "string"
        ),
      ],
      "type" : "Challenge",
      "responseMessages" : [
        swagger.errors.notFound('challange'),
      ],
      "nickname" : "getChallenge",
    },
    'action': getChallenge,
  })

  swagger.addPost({
    'spec': {
      "description" : "Operations about challenges",
      "path" : "/challenges/new",
      "notes" : "Returns a new challenge object",
      "summary" : "Create a new challenge",
      "method": "POST",
      "parameters" : [
        swagger.bodyParam(
          "challenge", "new Challenge", "Challenge"),
      ],
      "type" : "Challenge",
      "responseMessages" : [
        swagger.errors.invalid('body'),
      ],
      "nickname" : "createChallenge",
    },
    'action': createChallenge,
  })

  swagger.addPut({
    'spec': {
      "description" : "Operations about challenges",
      "path" : "/challenges/{id}",
      "notes" : "Returns the updated challenge object",
      "summary" : "Update a challenges",
      "method": "PUT",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of challange that needs to be updated", "string"),
        swagger.bodyParam(
          "challenge", "new Challenge", "Challenge", undefined, true),
      ],
      "type" : "Challenge",
      "responseMessages" : [
        swagger.errors.invalid('body'),
        swagger.errors.notFound('challange'),
      ],
      "nickname" : "updateChallenge",
    },
    'action': updateChallenge,
  })

  swagger.addDelete({
    'spec': {
      "description" : "Operations about challenges",
      "path" : "/challenges/{id}",
      "notes" : "Returns a status object",
      "summary" : "Deletes a challenge",
      "method": "DELETE",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of challange that needs to be deleted", "string"),
      ],
      "type" : "Challenge",
      "responseMessages" : [
        swagger.errors.notFound('challange'),
      ],
      "nickname" : "deleteChallenge",
    },
    'action': deleteChallenge,
  })

  function listChallenges(req,res) {
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
      .then(results => res.json(results))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getChallenge(req, res) {
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
      .then(results => {
        if (results) {
          res.json(results)
        } else {
          swagger.errors.notFound('challenge', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createChallenge(req, res) {
    if (req.body) {
      const validationErrors = swaggerValidate.model(req.body, models.Challenge)
      if (validationErrors) {
        swagger.errors.invalid('body', res)
        return
      }
    }
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

  function updateChallenge(req, res) {
    const validationErrors = swaggerValidate.model(req.body, models.Challenge)
    if (validationErrors) {
      swagger.errors.invalid('body', res)
      return
    }
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

  function deleteChallenge(req, res) {
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
