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
  var testTrial = {};
  describe('Trials API Routing', function() {

    it('should create a new trial with post', function(done) {
      request(app)
      .post('/trials/new')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id");
        testTrial = res.body;
        done();
      });
    });
    
    it('should list all trials', function(done) {
        request(app)
        .get('/trials/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.length.should.be.above(0);
          res.body.should.containEql(testTrial);
          done();
        });
    });

    it('should get trial by id', function(done) {
      request(app)
      .get('/trials/' + testTrial.id)
      //.expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testTrial);
        done();
      });
    });

    it('should update trial by id', function(done) {
      var testTrialJSON = {
        'name':'Test Trial',
        'game':'Test Game',
        'type':'Test Type',
        'description':'Test Description',
        'creator':'Anonymous'
      };
      request(app)
      .put('/trials/' + testTrial.id)
      .send(testTrialJSON)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testTrialJSON);
        done();
      });
    });
    
    it('should delete trial by id', function(done) {
      request(app)
      .delete('/trials/' + testTrial.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql('success');
        request(app)
        .get('/trials/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.not.containEql(testTrial);
          done();
        });
      });
    });
  });
});