module.exports = function() {

  function _getEnvURL() {
    switch(process.env.RGN_API_ENV){
      case 'dev':
        return 'http://retrogamenight-dev.herokuapp.com';

      case 'prod':
        return 'http://retrogamenight.herokuapp.com';

      default:
        return 'http://localhost';
    }
  }

  function _getApiPort() {
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
      url: _getEnvURL(),
      api_port: _getApiPort(),
      ui_port: _getUIPort()
    },
    auth: {
      google : {
        clientID      : '639156913273-35m8p1nqcgk812fri57dfk0ckiqo1qof.apps.googleusercontent.com',
        clientSecret  : '2EdJAN6HVFtiZbwBXJsISFo3',
        callbackURL   : _getEnvURL() + _getApiPort() + '/auth/google/callback'
      },
      facebook : {
        clientID: '700311303428355',
        clientSecret: 'e2a83ed12208abc0faf76b6f839fb8a0',
        callbackURL: _getEnvURL() + _getApiPort() + '/auth/facebook/callback'
      }
    }
  }

  console.log(appconfig);
  
  return appconfig;
}();
