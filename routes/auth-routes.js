/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
export default (app, passport) => {
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.send('Not Authorized')
  }

  app.get('/logged-in', ensureAuthenticated, (req, res) => {
    res.send(req.user)
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.send('Logged Out')
  })

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
    (req, res) => {
      // The request will be redirected to Google for authentication, so this
      // function will not be called.
    })

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/callback', 
    passport.authenticate('google'),
    (req, res) => {
      //res.send(req.user);
      res.redirect('http://localhost:8081')
    })

  app.get('/auth/facebook',
    passport.authenticate('facebook', {scope: 'email'}),
    (req, res) => {
      // The request will be redirected to facebook for authentication, so this
      // function will not be called.
    })

  // GET /auth/facebook/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook'),
    (req, res) => {
      //res.send(req.user);
      res.redirect('http://localhost:8081')
    })
}