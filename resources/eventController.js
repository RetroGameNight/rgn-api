/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { isValid } from '../validator'
import { models } from '../models'
import EventServiceClass from './eventService'

export default (swagger, rethinkdb) => {

  const eventService = new EventServiceClass(rethinkdb)

  swagger.addGet({
    'spec': {
      "nickname" : "listEvents",
      "description" : "Operations about events",
      "path" : "/events/all",
      "notes" : "Returns a array of event objects",
      "summary" : "List events",
      "method": "GET",
      "parameters" : [],
      "type" : "List[Event]",
      "responseMessages" : [],
    },
    'action': (req, res) => {
      eventService.list('startTime')
        .then(results => res.json(results))
    },
  })

  swagger.addGet({
    'spec': {
      "description" : "Operations about events",
      "path" : "/events/{id}",
      "notes" : "Returns an event object",
      "summary" : "Get event by id",
      "method": "GET",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of event that needs to be fetched", "string"),
      ],
      "type" : "Event",
      "responseMessages" : [
        swagger.errors.notFound('event'),
      ],
      "nickname" : "getEvent",
    },
    'action': (req, res) => {
      const eventID = req.params.id;
      eventService.get(eventID)
        .then(result => res.json(result))
        .catch(error => {
          swagger.errors.notFound('event', res)
        })
    },
  })

  swagger.addPost({
    'spec': {
      "description" : "Operations about events",
      "path" : "/events/new",
      "notes" : "Returns a new event object",
      "summary" : "Create a new event",
      "method": "POST",
      "parameters" : [
        swagger.bodyParam("event", "new Event", "Event"),
      ],
      "type" : "Event",
      "responseMessages" : [
        swagger.errors.invalid('body'),
      ],
      "nickname" : "createEvent",
    },
    'action': (req, res) => {
      if (req.body) {
        if (!isValid(req.body, models.Event)) {
          swagger.errors.invalid('body', res)
          return
        }
      }
      eventService.create(req.body)
        .then(newEvent => res.json(newEvent))
    },
  })

  swagger.addPut({
    'spec': {
      "description" : "Operations about events",
      "path" : "/events/{id}",
      "notes" : "Returns the updated event object",
      "summary" : "Update an event",
      "method": "PUT",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of event that needs to be updated", "string"),
        swagger.bodyParam(
          "event", "new Event", "Event"),
      ],
      "type" : "Event",
      "responseMessages" : [
        swagger.errors.invalid('body'),
        swagger.errors.notFound('event'),
      ],
      "nickname" : "updateEvent",
    },
    'action': (req, res) => {
      if (!isValid(req.body, models.Event)) {
        swagger.errors.invalid('body', res)
        return
      }
      const eventID = req.params.id
      eventService.update(eventID, req.body)
        .then(updatedEvent => res.json(updatedEvent))
        .catch(error => swagger.errors.notFound('event', res))
    },
  })

  swagger.addDelete({
    'spec': {
      "description" : "Operations about events",
      "path" : "/events/{id}",
      "notes" : "Returns a status object",
      "summary" : "Deletes an event",
      "method": "DELETE",
      "parameters" : [
        swagger.pathParam(
          "id", "ID of event that needs to be deleted", "string"),
      ],
      "type" : "Event",
      "responseMessages" : [
        swagger.errors.notFound('event'),
      ],
      "nickname" : "deleteEvent",
    },
    'action': (req, res) => {
      const eventID = req.params.id
      eventService.delete(eventID)
        .then(() => res.json({success: true}))
        .catch(error => swagger.errors.notFound('event', res))
    },
  })
}
