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

  describe('User API Routing', function() {
    it('should create a new user with get', function(done) {
      request(app)
    	.get('/users/new')
      .expect('Content-Type', /json/)
      .expect(200,done);
    });
  });
});