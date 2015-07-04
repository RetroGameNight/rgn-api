module.exports = function (app, rethinkdb) {
  app.route('/users/all')
    .get(listUsers)           // List all users
  app.route('/users/new')
    .post(createUser)         // Create a new user
    .get(createUser);
  app.route('/users/:id')
    .get(getUser)             // Get a specific user
    .put(updateUser)          // Update a specific user
    .delete(deleteUser);      // Delete a specific user

  function listUsers(req, res, next) {
      rethinkdb.table('users').orderBy({index: "id"}).run(rethinkdb.conn, function(error, cursor) {
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

  function getUser(req, res, next) {
    var userID = req.params.id;
    rethinkdb.table('users').get(userID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      res.json(result);
    });
  }

  function createUser(req, res, next) {
      var user = req.body;         // req.body was created by `bodyParser`
      user.createdAt = rethinkdb.now();    // Set the field `createdAt` to the current time
      rethinkdb.table('users').insert(user, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
          if (error) {
              handleError(res, error) 
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

  function updateUser(req, res, next) {
    var user = req.body;
    user.createdAt = req.body.createdAt;
    var userID = req.params.id;

    rethinkdb.table('users').get(userID).update(user, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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

  /*
   * Delete a todo item.
   */
  function deleteUser(req, res, next) {
    var userID = req.params.id;

    rethinkdb.table('users').get(userID).delete().run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      else {
        res.json({success: true});
      }
    });
  }
}
