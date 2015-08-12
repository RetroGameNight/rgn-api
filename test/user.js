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
  describe('User API Routing', function() {

    it('should create a new user with post', function(done) {
      request(app)
      .post('/users/new')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id");
        testUser = res.body;
        done();
      });
    });
    it('should list all users', function(done) {
        request(app)
        .get('/users/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.length.should.be.above(0);
          res.body.should.containEql(testUser);
          done();
        });
    });

    it('should get user by id', function(done) {
      request(app)
      .get('/users/' + testUser.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testUser);
        done();
      });
    });

    it('should update user by id', function(done) {
      var testUserJSON = {
        'email':'test@test.com',
        'name':'Test Guy',
        'avatarURL':'Test URL',
        'type':'test'
      };
      request(app)
      .put('/users/' + testUser.id)
      .send(testUserJSON)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testUserJSON);
        done();
      });
    });
    
    it('should delete user by id', function(done) {
      request(app)
      .delete('/users/' + testUser.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql('success');
        request(app)
        .get('/users/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.not.containEql(testUser);
          done();
        });
      });
    });
  });
});