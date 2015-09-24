/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { isValid } from '../validator'
import { models } from '../models'
import ChallengeServiceClass from './challengeService'

export default (swagger, rethinkdb) => {

  const challengeService = new ChallengeServiceClass(rethinkdb)

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
    'action': (req, res) => {
      challengeService.list('createdAt')
        .then(results => res.json(results))
    },
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
    'action': (req, res) => {
      const challengeID = req.params.id;
      challengeService.get(challengeID)
        .then(result => res.json(result))
        .catch(error => {
          swagger.errors.notFound('challange', res)
        })
    },
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
    'action': (req, res) => {
      if (req.body) {
        if (!isValid(req.body, models.Challenge)) {
          swagger.errors.invalid('body', res)
          return
        }
      }
      challengeService.create(req.body)
        .then(newChallenge => res.json(newChallenge))
    },
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
    'action': (req, res) => {
      if (!isValid(req.body, models.Challenge)) {
        swagger.errors.invalid('body', res)
        return
      }
      const challengeID = req.params.id
      challengeService.update(challengeID, req.body)
        .then(updatedChallenge => res.json(updatedChallenge))
        .catch(error => swagger.errors.notFound('challenge', res))
    },
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
    'action': (req, res) => {
      const challengeID = req.params.id
      challengeService.delete(challengeID)
        .then(() => res.json({success: true}))
        .catch(error => swagger.errors.notFound('challenge', res))
    },
  })
}