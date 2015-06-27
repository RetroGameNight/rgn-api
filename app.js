var express = require('express');
var appconfig = require('./config/appconfig');
var path = require('path');
var logger      = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var methodOverride = require('method-override');
var auth = require('./auth');
var rethinkdb = require('./db');

// Initialize Express App
var app = express();
app.use(logger());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(auth.passport.initialize());
app.use(auth.passport.session());

// Load in authentication routes
require('./routes/auth-routes')(app, auth.passport);
require('./routes/user-routes')(app, rethinkdb);
// Start server
app.listen(3000);
