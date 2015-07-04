module.exports = function (app, rethinkdb) {
  app.route('/records/all')
    .get(listRecords)           // List all Records
  app.route('/records/new')
    .post(createRecord)         // Create a new Record
    .get(createRecord);
  app.route('/records/:id')
    .get(getRecord)             // Get a specific Record
    .put(updateRecord)          // Update a specific Record
    .delete(deleteRecord);      // Delete a specific Record

  function listRecords(req, res, next) {
      rethinkdb.table('records').orderBy({index: "createdAt"}).run(rethinkdb.conn, function(error, cursor) {
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

  function getRecord(req, res, next) {
    var recordID = req.params.id;
    rethinkdb.table('records').get(recordID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      res.json(result);
    });
  }

  function createRecord(req, res, next) {
      var record = {};
      record.user = req.body.user || 'Anonymous';
      record.issuer = req.body.issuer || 'Anonymous';
      record.players = req.body.players || ['Anoymous'];
      record.challenge = req.body.challenge || ['Super Mario 10000 Points'];
      record.status = req.body.status || ['Open'];
      record.createdAt = rethinkdb.now();
      record.lastUpdated = rethinkdb.now();    // Set the field `createdAt` to the current time
      rethinkdb.table('records').insert(record, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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

  function updateRecord(req, res, next) {
    var recordID = req.params.id;
    var currentRecord = {};
    var record = {};
    rethinkdb.table('records').get(recordID).run(rethinkdb.conn, function(error, result) {
      if(error) {
        handleError(res, error) 
        next();
      }
      else {
        currentRecord = result;
        record.user = req.body.user || currentRecord.user;
        record.issuer = req.body.issuer || currentRecord.issuer;
        record.players = req.body.players || currentRecord.players;
        record.challenge = req.body.challenge || currentRecord.challenge;
        record.status = req.body.status || currentRecord.status;
        record.lastUpdated = rethinkdb.now();
        rethinkdb.table('records').get(recordID).update(record, {returnChanges: true}).run(rethinkdb.conn, function(error, result) {
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
  function deleteRecord(req, res, next) {
    var recordID = req.params.id;

    rethinkdb.table('records').get(recordID).delete().run(rethinkdb.conn, function(error, result) {
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
