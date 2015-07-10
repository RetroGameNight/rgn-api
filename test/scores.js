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
  var testScore = {};
  describe('Scores API Routing', function() {

    it('should create a new score with post', function(done) {
      request(app)
      .post('/scores/new')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id");
        testScore = res.body;
        done();
      });
    });
    
    it('should list all scores', function(done) {
        request(app)
        .get('/scores/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.length.should.be.above(0);
          res.body.should.containEql(testScore);
          done();
        });
    });

    it('should get score by id', function(done) {
      request(app)
      .get('/scores/' + testScore.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testScore);
        done();
      });
    });

    it('should update score by id', function(done) {
      var testScoreJSON = {
        'user':'Test score',
        'issuer':'Test Game',
        'challenge':'Test Challenge',
        'player':'Player 1',
        'status':'Open'
      };
      request(app)
      .put('/scores/' + testScore.id)
      .send(testScoreJSON)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testScoreJSON);
        done();
      });
    });
    
    it('should delete score by id', function(done) {
      request(app)
      .delete('/scores/' + testScore.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql('success');
        request(app)
        .get('/scores/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.not.containEql(testScore);
          done();
        });
      });
    });
  });
});