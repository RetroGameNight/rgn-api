module.exports = function (FacebookStrategy, GoogleStrategy, rethinkdb, appconfig, passport) {
  var GOOGLE_CLIENT_ID = appconfig.auth.google.clientID;
  var GOOGLE_CLIENT_SECRET = appconfig.auth.google.clientSecret;
  var FACEBOOK_CLIENT_ID = appconfig.auth.facebook.clientID;
  var FACEBOOK_CLIENT_SECRET = appconfig.auth.facebook.clientSecret;

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete Google profile is
  //   serialized and deserialized.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  var loginCallbackHandler = function (objectMapper, type) {
  return function (accessToken, refreshToken, profile, done) {
    if (accessToken !== null) {
      rethinkdb
        .table('users')
        .getAll(profile.emails[0].value, { index: 'email' })
        //.filter({ type: type })
        .run(rethinkdb.conn)
        .then(function (cursor) {
          return cursor.toArray()
            .then(function (users) {
              if (users.length > 0) {
                return done(null, users[0]);
              }
              return rethinkdb.table('users')
                .insert(objectMapper(profile))
                .run(rethinkdb.conn)
                .then(function (response) {
                  return rethinkdb.table('users')
                    .get(response.generated_keys[0])
                    .run(rethinkdb.conn);
                })
                .then(function (newUser) {
                  done(null, newUser);
                });
            });
        })
        .catch(function (err) {
          console.log('Error Getting User', err);
        });
      }
    };
  };
  // Use the GoogleStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Google
  //   profile), and invoke a callback with a user object.
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: appconfig.auth.google.callbackURL
    },
    loginCallbackHandler(function (profile) {
          return {
            'name': profile.displayName || null,
            'email': profile.emails[0].value,
            'avatarUrl': profile._json.avatar_url,
            'type': 'google',
            'createdAt': rethinkdb.now()
          };
        }, 'google')
  ));

  passport.use(new FacebookStrategy({
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: appconfig.auth.facebook.callbackURL
    },
    loginCallbackHandler(function (profile) {
      return {
        'name': profile.displayName || null,
        'email': profile.emails[0].value,
        'avatarUrl': profile._json.avatar_url,
        'type': 'facebook',
        'createdAt': rethinkdb.now()
      };
    }, 'facebook')
  ));
}