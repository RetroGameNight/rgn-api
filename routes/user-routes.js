module.exports = function (app, rethinkdb) {
  app.route('/users/all')
    .get(listUsers)           // List all users
  app.route('/users/new')
    .post(createUser)         // Create a new user
    .get(createUser)
  app.route('/users/:id')
    .get(getUser)             // Get a specific user
    .put(updateUser)          // Update a specific user
    .delete(deleteUser)       // Delete a specific user

  function listUsers(req, res, next) {
      rethinkdb.table('users').orderBy({index: "createdAt"}).run(rethinkdb.conn, (error, cursor) => {
          if (error) {
              handleError(res, error) 
              next()
          }
          else {
              // Retrieve all the todos in an array
              cursor.toArray((error, result) => {
                  if (error) {
                      handleError(res, error) 
                  }
                  else {
                      // Send back the data
                      res.json(result)
                  }
              })
          }
      })
  }

  function getUser(req, res, next) {
    const userID = req.params.id
    rethinkdb.table('users').get(userID).run(rethinkdb.conn, (error, result) => {
      if(error) {
        handleError(res, error) 
        next()
      }
      res.json(result)
    })
  }

  function createUser(req, res, next) {
      const user = {}
      user.name = req.body.name || "Anonymous"
      user.email = req.body.email || "Anonymous"
      user.avatarURL = req.body.avatarURL || ""
      user.type = req.body.type || "other"         // req.body was created by `bodyParser`
      user.createdAt = rethinkdb.now()
      user.lastUpdated = rethinkdb.now()    // Set the field `createdAt` to the current time
      rethinkdb.table('users').insert(user, {returnChanges: true}).run(rethinkdb.conn, (error, result) => {
          if (error) {
              handleError(res, error) 
              next()
          }
          else if (result.inserted !== 1) {
              handleError(res, new Error("Document was not inserted."))
              next()
          }
          else {
              res.json(result.changes[0].new_val)
          }
      })
  }

  function updateUser(req, res, next) {
    const userID = req.params.id
    const user = {}
    let currentUser = {}
    rethinkdb.table('users').get(userID).run(rethinkdb.conn, (error, result) => {
      if(error) {
        handleError(res, error) 
        next()
      }
      else {
        currentUser = result
        user.name = req.body.name || currentUser.name
        user.email = req.body.email || currentUser.email
        user.avatarURL = req.body.avatarURL || currentUser.avatarURL
        user.type = req.body.type || currentUser.type         // req.body was created by `bodyParser`
        user.lastUpdated = rethinkdb.now()
        rethinkdb.table('users').get(userID).update(user, {returnChanges: true}).run(rethinkdb.conn, (error, result) => {
          if(error) {
            //handleError(res, error) 
            throw error
            next()
          }
          else {
            res.json(result.changes[0].new_val)
          }
        })
      }
    })
  }

  /*
   * Delete a todo item.
   */
  function deleteUser(req, res, next) {
    const userID = req.params.id

    rethinkdb.table('users').get(userID).delete().run(rethinkdb.conn, (error, result) => {
      if(error) {
        handleError(res, error) 
        next()
      }
      else {
        res.json({success: true})
      }
    })
  }
}
