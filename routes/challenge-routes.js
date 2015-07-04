module.exports = function (app, rethinkdb) {
  app.route('/challenges/all')
    .get(listChallenges)           // List all challenges
  app.route('/challenges/new')
    .post(createChallenge)         // Create a new challenge
    .get(createChallenge);
  app.route('/challenges/:id')
    .get(getChallenge)             // Get a specific challenge
    .put(updateChallenge)          // Update a specific challenge
    .delete(deleteChallenge);      // Delete a specific challenge

  function listChallenges(req, res, next) {
      rethinkdb.table('challenges').orderBy({index: "createdAt"}).run(rethinkdb.conn, function(error, cursor) {
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

  function getChallenge(req, res, next) {
    var challengeID = req.params.id;
    rethinkdb.table('challenges').get(challengeID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      res.json(result);
    });
  }

  function createChallenge(req, res, next) {
      var challenge = {};
      challenge.name = req.body.name || "Unnamed challenge";
      challenge.game = req.body.game || "Unnamed Game";
      challenge.avatarURL = req.body.avatarURL || "";
      challenge.type = req.body.type || "Point";
      challenge.goal = req.body.goal || "10000";
      challenge.creator = req.body.creator || "Anonymous";
      challenge.createdAt = rethinkdb.now();
      challenge.lastUpdated = rethinkdb.now();    // Set the field `createdAt` to the current time
      rethinkdb.table('challenges').insert(challenge, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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

  function updateChallenge(req, res, next) {
    var challengeID = req.params.id;
    var currentchallenge = {};
    var challenge = {};
    rethinkdb.table('challenges').get(challengeID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      else {
        currentchallenge = result;
        challenge.name = req.body.name || currentchallenge.name;
        challenge.avatarURL = req.body.avatarURL || currentchallenge.avatarURL;
        challenge.game = req.body.game || currentchallenge.game;
        challenge.type = req.body.type || currentchallenge.type;
        challenge.goal = req.body.goal || currentchallenge.goal;
        challenge.owner = req.body.creator || currentchallenge.creator;
        challenge.lastUpdated = rethinkdb.now();
        rethinkdb.table('challenges').get(challengeID).update(challenge, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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
  function deleteChallenge(req, res, next) {
    var challengeID = req.params.id;

    rethinkdb.table('challenges').get(challengeID).delete().run(rethinkdb.conn, function(error, result) {
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
