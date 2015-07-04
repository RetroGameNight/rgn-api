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
      var newevent = {};
      newevent.startTime = req.body.startTime || rethinkdb.now();
      newevent.endTime = req.body.endTime || rethinkdb.now().add(14400);     // req.body was created by `bodyParser`  // Set the field `createdAt` to the current time

      rethinkdb.table('events').insert(newevent, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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
    var event = {};
    event.startTime = req.body.startTime;
    event.endTime = req.body.endTime; 
    var eventID = req.params.id;

    rethinkdb.table('events').get(eventID).update(event, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error);
        next();
      }
      else {
        res.json(result.changes[0].new_val);
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
