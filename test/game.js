/*
 * Retro Game Night
 * Copyright (c) 2015 Andrew Reder, Cameron White, Chris Loeper
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
 
"use strict"

var should = require('should'); 
var assert = require('assert');
var app = require('../app.bundle.js').app;
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

    it('should list trials for a game id', function(done) {
      createTestGame(function(game){
        var testGame = game;
        createTestTrial(testGame.id, function(trial){
          var testTrial = trial;
          request(app)
          .get('/trials/all')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) {
              throw err;
            }
            request(app)
            .get('/games/' + testGame.id + '/trials')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
              if (err) {
                throw err;
              }
              res.body.should.containEql(testTrial);
              
              // break down test objects
              deleteTestTrial(testTrial.id);
              deleteTestGame(testGame.id);
              done();
            });
          });
        });
      });
    });
  });
});

function createTestTrial(gameId, callback){
  var testTrialJSON = {
    'name':'Test Trial',
    'game': gameId,
    'description': 'Test Description',
    'creator': 'Anonymous'
  };
  request(app)
    .post('/trials/new')
    .send(testTrialJSON)
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

function deleteTestTrial(id){
  request(app)
  .delete('/trials/' + id)
  .end(function(err, res){
    if (err) {
      throw err;
    }
    //done();
  });
}

function deleteTestGame(id){
  request(app)
  .delete('/games/' + id)
  .end(function(err, res){
    if (err) {
      throw err;
    }
    //done();
  });
}