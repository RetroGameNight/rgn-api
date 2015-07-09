module.exports = function(app, passport){
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.send('Not Authorized');
  }

  app.get('/logged-in', ensureAuthenticated, function(req, res){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.send(req.user);
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.send('Logged Out');
  });

  /*app.get('/login', function(req, res){
    res.render('login', { user: req.user });
  });*/

  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve
  //   redirecting the user to google.com.  After authorization, Google
  //   will redirect the user back to this application at /auth/google/callback
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','email'] }),
    function(req, res){
      // The request will be redirected to Google for authentication, so this
      // function will not be called.
    });

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/callback', 
    passport.authenticate('google'),
    function(req, res) {
      //res.send(req.user);
      res.redirect('http://localhost:8081');
    });

  app.get('/auth/facebook',
    passport.authenticate('facebook', {scope: 'email'}),
    function(req, res){
      // The request will be redirected to facebook for authentication, so this
      // function will not be called.
    });

  // GET /auth/facebook/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook'),
    function(req, res) {
      //res.send(req.user);
      res.redirect('http://localhost:8081');
    });
}