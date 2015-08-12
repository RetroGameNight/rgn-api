import express from 'express'

import appconfig from './config/appconfig'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import session from 'express-session'
import methodOverride from 'method-override'

import rethinkdb from './db'
import passport from 'passport'
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'
import { Strategy as FacebookStrategy } from 'passport-facebook'

// Initialize Express App
const app = express()
const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', appconfig.env.ui.url + appconfig.env.ui.port);
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200)
    }
    else {
      next()
    }
}
app.use(allowCrossDomain)
app.use(logger('combined'))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(methodOverride())
app.use(session({
  secret: 'gamez rock',
  resave: true,
  saveUninitialized: true,
}))

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize())
app.use(passport.session())
require('./auth')(FacebookStrategy, GoogleStrategy, rethinkdb, appconfig, passport)

// Load in authentication routes
require('./routes/user-routes')(app, rethinkdb)
require('./routes/auth-routes')(app, appconfig, passport)
require('./routes/event-routes')(app, rethinkdb)
require('./routes/game-routes')(app, rethinkdb)
require('./routes/challenge-routes')(app, rethinkdb)
require('./routes/trial-routes')(app, rethinkdb)
require('./routes/score-routes')(app, rethinkdb)
// Start server
app.listen(3000)
module.exports.app = app;
