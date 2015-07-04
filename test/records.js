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
  var testRecord = {};
  describe('Records API Routing', function() {

    it('should create a new record with post', function(done) {
      request(app)
      .post('/records/new')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id");
        testRecord = res.body;
        done();
      });
    });
    
    it('should list all records', function(done) {
        request(app)
        .get('/records/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.length.should.be.above(0);
          res.body.should.containEql(testRecord);
          done();
        });
    });

    it('should get record by id', function(done) {
      request(app)
      .get('/records/' + testRecord.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testRecord);
        done();
      });
    });

    it('should update record by id', function(done) {
      var testRecordJSON = {
        'user':'Test Record',
        'issuer':'Test Game',
        'challenge':'Test Challenge',
        'players':['Player 1','avidreder@gmail.com'],
        'status':'Open'
      };
      request(app)
      .put('/records/' + testRecord.id)
      .send(testRecordJSON)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql(testRecordJSON);
        done();
      });
    });
    
    it('should delete record by id', function(done) {
      request(app)
      .delete('/records/' + testRecord.id)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          throw err;
        }
        res.body.should.containEql('success');
        request(app)
        .get('/records/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) {
            throw err;
          }
          res.body.should.not.containEql(testRecord);
          done();
        });
      });
    });
  });
});