var express = require('express');

var appconfig = require('./config/appconfig');
var path = require('path');
var logger      = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var methodOverride = require('method-override');

var rethinkdb = require('./db');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// Initialize Express App
var app = express();
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081, http://retrogamenight-dev.herokuapp.com, http://retrogamenight.herokuapp.com');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(session({
  secret: 'gamez rock',
  resave: true,
  saveUninitialized: true
}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
require('./auth')(FacebookStrategy, GoogleStrategy, rethinkdb, appconfig, passport);

// Load in authentication routes
require('./routes/auth-routes')(app, passport);
require('./routes/user-routes')(app, rethinkdb);
require('./routes/event-routes')(app, rethinkdb);
require('./routes/game-routes')(app, rethinkdb);
require('./routes/challenge-routes')(app, rethinkdb);
require('./routes/trial-routes')(app, rethinkdb);
require('./routes/score-routes')(app, rethinkdb);
// Start server
app.listen(3000);
module.exports.app = app;
