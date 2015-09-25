module.exports = function() {

  function _getUIURL() {
    switch(process.env.RGN_API_ENV){
      case 'dev':
        return 'http://retrogamenight-dev.herokuapp.com';

      case 'prod':
        return 'http://retrogamenight.herokuapp.com';

      default:
        return 'http://localhost';
    }
  }

  function _getAPIURL() {
    switch(process.env.RGN_API_ENV){
      case 'dev':
        return 'http://api.retrogamenight.net';

      case 'prod':
        return 'http://api.retrogamenight.net';

      default:
        return 'http://localhost';
    }
  }

  function _getAPIPort() {
    switch(process.env.RGN_API_ENV){
      case 'dev':
        return '';

      case 'prod':
        return '';

      default:
        return ':3000';
    }
  }

  function _getUIPort() {
    switch(process.env.RGN_API_ENV){
      case 'dev':
        return '';

      case 'prod':
        return '';

      default:
        return ':8081';
    }
  }

  var appconfig = {
    rethinkdb: {
      host: 'localhost',
      port: 28015,
      db: 'rgn'
    },
    express: {
      port: 3000
    },
    env: {
      type: (process.env.RGN_API_ENV || 'local'),
      ui: {

        url: _getUIURL(),
        port: _getUIPort()
      },
      api: {
        url: _getAPIURL(),
        port: _getAPIPort()
      }
    },
    auth: {
      google : {
        clientID      : '639156913273-35m8p1nqcgk812fri57dfk0ckiqo1qof.apps.googleusercontent.com',
        clientSecret  : '2EdJAN6HVFtiZbwBXJsISFo3',
        callbackURL   : _getAPIURL() + _getAPIPort() + '/auth/google/callback'
      },
      facebook : {
        clientID: '700311303428355',
        clientSecret: 'e2a83ed12208abc0faf76b6f839fb8a0',
        callbackURL: _getAPIURL() + _getAPIPort() + '/auth/facebook/callback'
      }
    }
  };
  
  return appconfig;
}();
