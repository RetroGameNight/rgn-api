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
app.use(logger());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

require('./auth')(FacebookStrategy, GoogleStrategy, rethinkdb, appconfig, passport);

// Load in authentication routes
require('./routes/auth-routes')(app, passport);
require('./routes/user-routes')(app, rethinkdb);
// Start server
app.listen(3000);
