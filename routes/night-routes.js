module.exports = function (app, rethinkdb) {
  app.route('/nights/all')
      .get(listNights)
      .post(createNight);            // Retrieve all the todos
  app.route('/nights/new')
      .post(createNight)             // Create a new todo
      .get(createNight);
  app.route('/nights/:id')
    .get(getNight)
    .put(updateNight)
    .delete(deleteNight);
  //app.route('/user/update').put(update);         // Update a todo
  //app.route('/user/delete').post(del);        // Delete a todo
  Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
  }
  function listNights(req, res, next) {
      rethinkdb.table('nights').orderBy({index: "startTime"}).run(rethinkdb.conn, function(error, cursor) {
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
  function getNight(req, res, next) {
    var nightID = req.params.id;

    rethinkdb.table('nights').get(nightID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      else {
        res.json(result);
      }
    });
  }

  function createNight(req, res, next) {
      var newNight = {};
      newNight.startTime = req.body.startTime || rethinkdb.now();
      newNight.endTime = req.body.endTime || rethinkdb.now().add(14400);     // req.body was created by `bodyParser`  // Set the field `createdAt` to the current time

      rethinkdb.table('nights').insert(newNight, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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

  function updateNight(req, res, next) {
    var night = {};
    night.startTime = req.body.startTime;
    night.endTime = req.body.endTime; 
    var nightID = req.params.id;

    rethinkdb.table('nights').get(nightID).update(night, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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
  function deleteNight(req, res, next) {
    var nightID = req.params.id;

    rethinkdb.table('nights').get(nightID).delete().run(rethinkdb.conn, function(error, result) {
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
