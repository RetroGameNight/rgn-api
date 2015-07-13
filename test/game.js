var should = require('should'); 
var assert = require('assert');
var app = require('../app.js').app;
var request = require('supertest');

describe('Routing', function(){
  before(function(done) {
    // In our tests we use the test db
    setTimeout(function(){
      done();
    }, 500);
    
  });
  var testGame = {};
  describe('Games API Routing', function() {

    it('should create a new game with post', function(done) {
      request(app)
      .post('/games/new')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id");
        testGame = res.body;
        done();
      });
    });
    
    it('should list all games', function(done) {
        request(app)
        .get('/games/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.length.should.be.above(0);
          res.body.should.containEql(testGame);
          done();
        });
    });

    it('should get game by id', function(done) {
      request(app)
      .get('/games/' + testGame.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testGame);
        done();
      });
    });

    it('should update game by id', function(done) {
      var testGameJSON = {
        'name':'Test Game',
        'system':'Test System',
        'avatarURL':'Test URL'
      };
      request(app)
      .put('/games/' + testGame.id)
      .send(testGameJSON)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testGameJSON);
        done();
      });
    });
    
    it('should delete game by id', function(done) {
      request(app)
      .delete('/games/' + testGame.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql('success');
        request(app)
        .get('/games/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.not.containEql(testGame);
          done();
        });
      });
    });

    it('should list challenges for a game id', function(done) {
      createTestGame(function(game){
        var testGame = game;
        createTestChallenge(testGame.id, function(challenge){
          var testChallenge = challenge;
          request(app)
          .get('/challenges/all')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) {
              throw err;
            }
            request(app)
            .get('/games/' + testGame.id + '/challenges')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
              if (err) {
                throw err;
              }
              res.body.should.containEql(testChallenge);
              
              // break down test objects
              deleteTestChallenge(testChallenge.id);
              deleteTestGame(testGame.id);
              done();
            });
          });
        });
      });
    });
  });
});

function createTestChallenge(gameId, callback){
  var testChallengeJSON = {
    'name':'Test Challenge',
    'game': gameId,
    'avatarURL':'Test URL',
    'type': 'Point',
    'goal': '10000',
    'creator': 'Anonymous'
  };
  request(app)
    .post('/challenges/new')
    .send(testChallengeJSON)
    .end(function(err, res){
      if (err) {
        throw err;
      }
      callback(res.body);
  });
}

function createTestGame(callback) {
  var testGameJSON = {
    'name':'Test Game',
    'system':'Test System',
    'avatarURL':'Test URL'
  };
  request(app)
    .post('/games/new')
    .send(testGameJSON)
    .end(function(err, res){
      if (err) {
        throw err;
      }
      callback(res.body);
  });
}

function deleteTestChallenge(id){
  request(app)
  .delete('/challenges/' + id)
  .end(function(err, res){
    if (err) {
      throw err;
    }
    done();
  });
}

function deleteTestGame(id){
  request(app)
  .delete('/games/' + id)
  .end(function(err, res){
    if (err) {
      throw err;
    }
    done();
  });
}