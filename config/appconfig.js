module.exports = {
  rethinkdb: {
    host: 'localhost',
    port: 28015,
    db: 'rgn',
  },
  express: {
    port: 3000,
  },
  auth: {
    'google' : {
      'clientID'      : '639156913273-35m8p1nqcgk812fri57dfk0ckiqo1qof.apps.googleusercontent.com',
      'clientSecret'  : '2EdJAN6HVFtiZbwBXJsISFo3',
      'callbackURL'   : 'http://localhost:3000/auth/google/callback',
    },
    'facebook' : {
      'clientID': '700311303428355',
      'clientSecret': 'e2a83ed12208abc0faf76b6f839fb8a0',
      'callbackURL': 'http://localhost:3000/auth/facebook/callback',
    }
  }
};