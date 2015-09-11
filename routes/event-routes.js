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
  app.route('/events/all')
      .get(listEvents)
      .post(createEvent)             // Retrieve all the todos
  app.route('/events/new')
      .post(createEvent)             // Create a new todo
      .get(createEvent)
  app.route('/events/:id')
    .get(getEvent)
    .put(updateEvent)
    .delete(deleteEvent)
  //app.route('/user/update').put(update)          // Update a todo
  //app.route('/user/delete').post(del)         // Delete a todo
  function listEvents(req, res, next) {
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
  function getEvent(req, res, next) {
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
      .then(result => res.json(result))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  function createEvent(req, res, next) {
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

  function updateEvent(req, res, next) {
    const eventID = req.params.id
    let connection = null
    rethinkdb.connect(appconfig.rethinkdb)
      .then(conn => {
        connection = conn
        return rethinkdb
          .table('events')
          .get(eventID)
          .run(connection)
      })
      .then(result => {
        const event = {}
        const currentEvent = result
        event.name = req.body.name || currentEvent.name
        event.owner = req.body.owner || currentEvent.owner
        event.startTime = req.body.startTime || currentEvent.startTime
        event.people = req.body.people || currentEvent.people
        event.endTime = req.body.endTime || currentEvent.endTime
        event.avatarURL = req.body.avatarURL || currentEvent.avatarURL
        event.type = req.body.type || currentEvent.type         // req.body was created by `bodyParser`
        event.lastUpdated = rethinkdb.now()
        return event
      })
      .then(event => rethinkdb
        .table('events')
        .get(eventID)
        .update(event, {returnChanges: true})
        .run(connection)
      )
      .then(result => res.json(result.changes[0].new_val))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }

  /*
   * Delete a todo item.
   */
  function deleteEvent(req, res, next) {
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
      .then(() => res.json({success: true}))
      .then(() => connection.close())
      .error(error => handleError(res, error))
  }
}
