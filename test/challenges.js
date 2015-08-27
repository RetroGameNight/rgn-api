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
  var testChallenge = {};
  describe('Challenges API Routing', function() {

    it('should create a new challenge with post', function(done) {
      request(app)
      .post('/challenges/new')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id");
        testChallenge = res.body;
        done();
      });
    });
    
    it('should list all challenges', function(done) {
        request(app)
        .get('/challenges/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.length.should.be.above(0);
          res.body.should.containEql(testChallenge);
          done();
        });
    });

    it('should get challenge by id', function(done) {
      request(app)
      .get('/challenges/' + testChallenge.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testChallenge);
        done();
      });
    });

    it('should update challenge by id', function(done) {
      var testChallengeJSON = {
        'trial':'Test Trial',
        //'goal':'Test Goal',
        'issuer':'Anonymous',
        'player':'Anonymous',
        'challengeStatus':'Pending'
      };
      request(app)
      .put('/challenges/' + testChallenge.id)
      .send(testChallengeJSON)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testChallengeJSON);
        done();
      });
    });
    
    it('should delete challenge by id', function(done) {
      request(app)
      .delete('/challenges/' + testChallenge.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql('success');
        request(app)
        .get('/challenges/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.not.containEql(testChallenge);
          done();
        });
      });
    });
  });
});