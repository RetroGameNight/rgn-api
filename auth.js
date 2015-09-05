/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import appconfig from './config/appconfig'

export default (FacebookStrategy, GoogleStrategy, rethinkdb, appconfig, passport) => {
  const GOOGLE_CLIENT_ID = appconfig.auth.google.clientID
  const GOOGLE_CLIENT_SECRET = appconfig.auth.google.clientSecret
  const FACEBOOK_CLIENT_ID = appconfig.auth.facebook.clientID
  const FACEBOOK_CLIENT_SECRET = appconfig.auth.facebook.clientSecret

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete Google profile is
  //   serialized and deserialized.
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((obj, done) => {
    done(null, obj)
  })

  const loginCallbackHandler = (objectMapper, type) => 
    (accessToken, refreshToken, profile, done) => {
      if (accessToken !== null) {
        rethinkdb.connect(appconfig.rethinkdb, (err, conn) => {
          rethinkdb
            .table('users')
            .getAll(profile.emails[0].value, { index: 'email' })
            //.filter({ type: type })
            .run(conn)
            .then(cursor => {
              return cursor.toArray()
                .then(users => {
                  if (users.length > 0) {
                    return done(null, users[0])
                  }
                  return rethinkdb.table('users')
                    .insert(objectMapper(profile))
                    .run(conn)
                    .then(response => {
                      return rethinkdb.table('users')
                        .get(response.generated_keys[0])
                        .run(rethinkdb.conn)
                        .then(newUser => {
                          return done(null, newUser)
                        })
                    })
                })    
              })
            })
            /*.catch(err => {
              console.log('Error Getting User', err)
            })*/
          }
        }
      
  // Use the GoogleStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Google
  //   profile), and invoke a callback with a user object.
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: appconfig.auth.google.callbackURL,
    },
    loginCallbackHandler(profile => ({
            'name': profile.displayName || null,
            'email': profile.emails[0].value,
            'avatarUrl': profile.photos[0].value || '',
            'type': 'google',
            'createdAt': rethinkdb.now(),
        }), 'google')
  ))

  passport.use(new FacebookStrategy({
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: appconfig.auth.facebook.callbackURL,
    },
    loginCallbackHandler(profile => ({
        'name': profile.displayName || null,
        'email': profile.emails[0].value,
        'avatarUrl': 'https://graph.facebook.com/' + profile.id + '/picture' || '',
        'type': 'facebook',
        'createdAt': rethinkdb.now(),
    }), 'facebook')
  ))
}