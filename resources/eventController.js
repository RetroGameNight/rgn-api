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
    'action': listEvents,
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
    'action': getEvent,
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
    'action': createEvent,
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
    'action': updateEvent,
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
    'action': deleteEvent,
  })

  function defaultPost() {
    const now = rethinkdb.now()
    return {
      startTime: now,
      endTime: now.add(14400),
      name: "Unnamed Game Night",
      owner: "Anonymous",
      people: [],
      avatarURL: "",
      type: "other",
      createdAt: now,
      lastUpdated: now,
    }
  }

  function listEvents(req, res) {
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('events')
          .orderBy({index: "startTime"})
          .run(connection)
      })
      .then(cursor => cursor.toArray())
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function getEvent(req, res) {
    let connection = null
    const eventID = req.params.id
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('events')
          .get(eventID)
          .run(conn)
      })
      .then(results => {
        if (results) {
          res.json(results)
        } else {
          swagger.errors.notFound('event', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createEvent(req, res) {
    if (req.body) {
      if (!isValid(req.body, models.Event)) {
        swagger.errors.invalid('body', res)
        return
      }
    }
    let connection = null
    const event = {}
    event.startTime = req.body.startTime || rethinkdb.now()
    event.endTime = req.body.endTime || rethinkdb.now().add(14400)      // req.body was created by `bodyParser`  // Set the field `createdAt` to the current time
    event.name = req.body.name || "Unnamed Game Night"
    event.owner = req.body.owner || "Anonymous"
    event.people = req.body.people || []
    event.avatarURL = req.body.avatarURL || ""
    event.type = req.body.type || "other"         // req.body was created by `bodyParser`
    event.createdAt = rethinkdb.now()
    event.lastUpdated = rethinkdb.now()
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('events')
          .insert(event, {returnChanges: true})
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

  function updateEvent(req, res) {
    if (!isValid(req.body, models.Event)) {
      swagger.errors.invalid('body', res)
      return
    }
    const eventID = req.params.id
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('events')
          .get(eventID)
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
          swagger.errors.notFound('event', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteEvent(req, res) {
    const eventID = req.params.id

    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('events')
          .get(eventID)
          .delete()
          .run(connection)
      })
      .then(status => {
        if (status.deleted == 1) {
          res.json({success: true})
        } else {
          swagger.errors.notFound('event', res)
        }
      })
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
