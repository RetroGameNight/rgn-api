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
        'name':'Test Challenge',
        'game':'Test Game',
        'avatarURL':'Test URL',
        'type':'Test Type',
        'goal':'Test Goal',
        'creator':'Anonymous'
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