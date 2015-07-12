module.exports = function (app, rethinkdb) {
  app.route('/events/all')
      .get(listEvents)
      .post(createEvent);            // Retrieve all the todos
  app.route('/events/new')
      .post(createEvent)             // Create a new todo
      .get(createEvent);
  app.route('/events/:id')
    .get(getEvent)
    .put(updateEvent)
    .delete(deleteEvent);
  //app.route('/user/update').put(update);         // Update a todo
  //app.route('/user/delete').post(del);        // Delete a todo
  function listEvents(req, res, next) {
      rethinkdb.table('events').orderBy({index: "startTime"}).run(rethinkdb.conn, function(error, cursor) {
          if (error) {
              handleError(res, error) 
              next();
          }
          else {
              // Retrieve all the todos in an array
              cursor.toArray(function(error, result) {
                  if (error) {
                      handleError(res, error) 
                  }
                  else {
                      // Send back the data
                      res.json(result);
                  }
              });
          }
      });
  }
  function getEvent(req, res, next) {
    var eventID = req.params.id;

    rethinkdb.table('events').get(eventID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      else {
        res.json(result);
      }
    });
  }

  function createEvent(req, res, next) {
      var newEvent = {};
      newEvent.startTime = req.body.startTime || rethinkdb.now();
      newEvent.endTime = req.body.endTime || rethinkdb.now().add(14400);     // req.body was created by `bodyParser`  // Set the field `createdAt` to the current time
      newEvent.name = req.body.name || "Unnamed Game Night";
      newEvent.owner = req.body.owner || "Anonymous";
      newEvent.people = req.body.people || [];
      newEvent.avatarURL = req.body.avatarURL || "";
      newEvent.type = req.body.type || "other";        // req.body was created by `bodyParser`
      newEvent.createdAt = rethinkdb.now();
      newEvent.lastUpdated = rethinkdb.now();
      rethinkdb.table('events').insert(newEvent, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
          if (error) {
            handleError(res, error);
            next();
          }
          else if (result.inserted !== 1) {
            handleError(res, new Error("Document was not inserted."));
            next();
          }
          else {
            res.json(result.changes[0].new_val);
          } 
      });
  }

  function updateEvent(req, res, next) {
    var eventID = req.params.id;
    var currentEvent = {};
    var updatedEvent = {};
    rethinkdb.table('events').get(eventID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      else {
        currentEvent = result;
        updatedEvent.name = req.body.name || currentEvent.name;
        updatedEvent.owner = req.body.owner || currentEvent.owner;
        updatedEvent.startTime = req.body.startTime || currentEvent.startTime;
        updatedEvent.people = req.body.people || currentEvent.people;
        updatedEvent.endTime = req.body.endTime || currentEvent.endTime;
        updatedEvent.avatarURL = req.body.avatarURL || currentEvent.avatarURL;
        updatedEvent.type = req.body.type || currentEvent.type;        // req.body was created by `bodyParser`
        updatedEvent.lastUpdated = rethinkdb.now();
        rethinkdb.table('events').get(eventID).update(updatedEvent, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
          if(error) {
            //handleError(res, error) 
            throw error;
            next();
          }
          else {
            res.json(result.changes[0].new_val);      
          }
        });
      }
    });
  }

  /*
   * Delete a todo item.
   */
  function deleteEvent(req, res, next) {
    var eventID = req.params.id;

    rethinkdb.table('events').get(eventID).delete().run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error);
        next();
      }
      else {
        res.json({success: true});
      }
    });
  }
}
