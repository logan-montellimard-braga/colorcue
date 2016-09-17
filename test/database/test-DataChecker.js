var chai   = require('chai');
var should = chai.should();
var path   = require('path');
var os     = require('os');
var fs     = require('fs');

var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var Initializer = require('../../lib/database/Initializer').default;
var DataCleaner = require('../../lib/database/DataCleaner').default;
var DataChecker = require('../../lib/database/DataChecker').default;

var DB_PATH = path.join(os.tmpdir(), 'colorcue', 'test-db.data');
var DATA_PATH = 'test/data/data.txt';

describe('Data checker', function() {

  before(function(done) {
    var init = new Initializer(DB_PATH).setUp();
    var cleaner = new DataCleaner(DATA_PATH);
    cleaner.cleanup().then(function(data) {
      init.populateWith(data)
      .then(function() { done(); });
    });
  });

  it('should return a report on the database', function(done) {
    var checker = new DataChecker(DB_PATH);
    checker.check().then(function(report) {
      report.should.have.property('scores');
      report.should.have.property('words');
      report.should.have.property('max');
      report.should.have.property('min');
      report.should.have.property('maxNScore');
      report.should.have.property('minNScore');

    }).should.be.fulfilled.notify(done);
  });

  after(function() {
    fs.unlinkSync(DB_PATH);
    fs.rmdirSync(path.dirname(DB_PATH));
  });

});
