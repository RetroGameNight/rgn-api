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
  var testUser = {};
  describe('Events API Routing', function() {

    it('should create a new event with post', function(done) {
      request(app)
      .post('/events/new')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id");
        testEvent = res.body;
        done();
      });
    });
    
    it('should list all events', function(done) {
        request(app)
        .get('/events/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.length.should.be.above(0);
          res.body.should.containEql(testEvent);
          done();
        });
    });

    it('should get event by id', function(done) {
      request(app)
      .get('/events/' + testEvent.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testEvent);
        done();
      });
    });

    it('should update event by id', function(done) {
      var testEventJSON = {
        'name':'Test game night',
        'startTime':'Now',
        'endTime':'Four hours from now',
        'people':['avidreder@gmail.com','test@test.com'],
        'avatarURL':'Test URL',
        'owner':'avidreder@gmail.com',
        'type':'test'
      };
      request(app)
      .put('/events/' + testEvent.id)
      .send(testEventJSON)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testEventJSON);
        done();
      });
    });
    
    it('should delete event by id', function(done) {
      request(app)
      .delete('/events/' + testEvent.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql('success');
        request(app)
        .get('/events/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.not.containEql(testEvent);
          done();
        });
      });
    });
  });
});