/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
import { isValid } from '../validator'
import { models } from '../models'
import TrialServiceClass from './trialService'

export default (swagger, rethinkdb) => {

  const trialService = new TrialServiceClass(rethinkdb)

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
    'action': (req, res) => {
      trialService.list('createdAt')
        .then(results => res.json(results))
    },
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
    'action': (req, res) => {
      const trialID = req.params.id;
      trialService.get(trialID)
        .then(result => res.json(result))
        .catch(error => {
          swagger.errors.notFound('trial', res)
        })
    },
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
    'action': (req, res) => {
      if (req.body) {
        if (!isValid(req.body, models.Trial)) {
          swagger.errors.invalid('body', res)
          return
        }
      }
      trialService.create(req.body)
        .then(newTrial => res.json(newTrial))
    },
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
    'action': (req, res) => {
      if (!isValid(req.body, models.Trial)) {
        swagger.errors.invalid('body', res)
        return
      }
      const trialID = req.params.id
      trialService.update(trialID, req.body)
        .then(updatedTrial => res.json(updatedTrial))
        .catch(error => swagger.errors.notFound('trial', res))
    },
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
    'action': (req, res) => {
      const trialID = req.params.id
      trialService.delete(trialID)
        .then(() => res.json({success: true}))
        .catch(error => swagger.errors.notFound('trial', res))
    },
  })
}
