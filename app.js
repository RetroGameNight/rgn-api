var express = require('express');
var async = require('async');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var config = require(__dirname + '/config/configdb.js');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(createConnection);

//app.use('/', routes);
//app.use('/users', users);

app.route('/users')
    .get(listUsers)
    .post(createUser);             // Retrieve all the todos
app.route('/users/new')
    .post(createUser)             // Create a new todo
    .get(createUser);
app.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);
//app.route('/user/update').put(update);         // Update a todo
//app.route('/user/delete').post(del);        // Delete a todo

function listUsers(req, res, next) {
    r.table('users').orderBy({index: "createdAt"}).run(req._rdbConn, function(error, cursor) {
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
                    res.send(JSON.stringify(result));
                }
            });
        }
    });
}

function getUser(req, res, next) {
  var userID = req.params.id;

  r.table('users').get(userID).run(req.app._rdbConn, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json(result);
  });
}

function createUser(req, res, next) {
    var user = req.body;         // req.body was created by `bodyParser`
    user.createdAt = r.now();    // Set the field `createdAt` to the current time

    r.table('users').insert(user, {returnChanges: true}).run(req._rdbConn, function(error, result) {
        if (error) {
            handleError(res, error) 
        }
        else if (result.inserted !== 1) {
            handleError(res, new Error("Document was not inserted.")) 
        }
        else {
            res.send(JSON.stringify(result.changes[0].new_val));
        }
        next();
    });
}

function updateUser(req, res, next) {
  var user = req.body;
  var userID = req.params.id;

  r.table('users').get(userID).update(user, {returnChanges: true}).run(req.app._rdbConn, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json(result.changes[0].new_val);
  });
}

/*
 * Delete a todo item.
 */
function deleteUser(req, res, next) {
  var userID = req.params.id;

  r.table('users').get(userID).delete().run(req.app._rdbConn, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json({success: true});
  });
}

app.use(closeConnection);

// open up connection to rethinkdb

function createConnection(req, res, next) {
    r.connect(config.rethinkdb, function(error, conn) {
        if (error) {
            handleError(res, error);
        }
        else {
            // Save the connection in `req`
            req._rdbConn = conn;
            // Pass the current request to the next middleware
            next();
        }
    });
}

// close connection to rethinkdb

function closeConnection(req, res, next) {
    req._rdbConn.close();
    next();
}


// catch 404 and forward to error handler

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function startExpress(connection) {
  app._rdbConn = connection;
  app.listen(config.express.port);
  console.log('Listening on port ' + config.express.port);
}

async.waterfall([
  function connect(callback) {
    r.connect(config.rethinkdb, callback);
  },
  function createDatabase(connection, callback) {
    //Create the database if needed.
    r.dbList().contains(config.rethinkdb.db).do(function(containsDb) {
      return r.branch(
        containsDb,
        {created: 0},
        r.dbCreate(config.rethinkdb.db)
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },
  function createTable(connection, callback) {
    //Create the table if needed.
    r.tableList().contains('users').do(function(containsTable) {
      return r.branch(
        containsTable,
        {created: 0},
        r.tableCreate('users')
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },
  function createIndex(connection, callback) {
    //Create the index if needed.
    r.table('users').indexList().contains('createdAt').do(function(hasIndex) {
      return r.branch(
        hasIndex,
        {created: 0},
        r.table('users').indexCreate('createdAt')
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },
  function waitForIndex(connection, callback) {
    //Wait for the index to be ready.
    r.table('users').indexWait('createdAt').run(connection, function(err, result) {
      callback(err, connection);
    });
  }
], function(err, connection) {
  if(err) {
    console.error(err);
    process.exit(1);
    return;
  }

  startExpress(connection);
});

//module.exports = app;
