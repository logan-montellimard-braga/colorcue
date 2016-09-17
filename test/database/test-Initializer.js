var chai   = require('chai');
var should = chai.should();
var path   = require('path');
var os     = require('os');
var fs     = require('fs');

var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var Initializer = require('../../lib/database/Initializer').default;
var DataCleaner = require('../../lib/database/DataCleaner').default;

var DB_PATH = path.join(os.tmpdir(), 'colorcue', 'test-db.data');
var DATA_PATH = 'test/data/data.txt';

describe('Database Initializer', function() {

  it('should create database folder', function() {
    var init = new Initializer(DB_PATH).setUp();
    (function() { fs.statSync(path.dirname(DB_PATH)); }).should.not.throw;
  });

  it('should fill database with data', function(done) {
    var init = new Initializer(DB_PATH).setUp();
    var cleaner = new DataCleaner(DATA_PATH);
    cleaner.cleanup().then(function(data) {
      init.populateWith(data).should.be.fulfilled.notify(done);
    });
  });

  after(function() {
    fs.unlinkSync(DB_PATH);
    fs.rmdirSync(path.dirname(DB_PATH));
  });

});


