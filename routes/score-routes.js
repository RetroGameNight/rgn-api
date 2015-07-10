module.exports = function (app, rethinkdb) {
  app.route('/scores/all')
    .get(listScores)           // List all scores
  app.route('/scores/new')
    .post(createScore)         // Create a new score
    .get(createScore);
  app.route('/scores/:id')
    .get(getScore)             // Get a specific score
    .put(updateScore)          // Update a specific score
    .delete(deleteScore);      // Delete a specific score

  function listScores(req, res, next) {
      rethinkdb.table('scores').orderBy({index: "createdAt"}).run(rethinkdb.conn, function(error, cursor) {
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

  function getScore(req, res, next) {
    var scoreID = req.params.id;
    rethinkdb.table('scores').get(scoreID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      res.json(result);
    });
  }

  function createScore(req, res, next) {
      var score = {};
      score.user = req.body.user || 'Anonymous';
      score.issuer = req.body.issuer || 'Anonymous';
      score.player = req.body.players || 'Anoymous';
      score.challenge = req.body.challenge || ['Super Mario 10000 Points'];
      score.status = req.body.status || ['Open'];
      score.createdAt = rethinkdb.now();
      score.lastUpdated = rethinkdb.now();    // Set the field `createdAt` to the current time
      rethinkdb.table('scores').insert(score, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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

  function updateScore(req, res, next) {
    var scoreID = req.params.id;
    var currentScore = {};
    var score = {};
    rethinkdb.table('scores').get(scoreID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      else {
        currentScore = result;
        score.user = req.body.user || currentScore.user;
        score.issuer = req.body.issuer || currentScore.issuer;
        score.player = req.body.player || currentScore.player;
        score.challenge = req.body.challenge || currentScore.challenge;
        score.status = req.body.status || currentScore.status;
        score.lastUpdated = rethinkdb.now();
        rethinkdb.table('scores').get(scoreID).update(score, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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
  function deleteScore(req, res, next) {
    var scoreID = req.params.id;

    rethinkdb.table('scores').get(scoreID).delete().run(rethinkdb.conn, function(error, result) {
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
