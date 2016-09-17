var chai   = require('chai');
var should = chai.should();
var path   = require('path');
var os     = require('os');
var fs     = require('fs');
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var Initializer = require('../../lib/database/Initializer').default;
var DataCleaner = require('../../lib/database/DataCleaner').default;
var DB_PATH = path.join(os.tmpdir(), 'colorcue', 'test', 'db.data');
var DATA_PATH = 'test/data/data.txt';
var Encoder = require('../../lib/colors/Encoder').default;
var encoder = new Encoder(DB_PATH);

describe('Encoder', function() {

  before(function() {
    var init = new Initializer(DB_PATH).setUp();
    var cleaner = new DataCleaner(DATA_PATH);
    cleaner.cleanup().then(function(data) {
      init.populateWith(data)
        .then(function() { done(); });
    });
  })

  it('should reject use without string setup', function(done) {
    encoder.encode().should.be.rejected.notify(done);
  });

  it('should allow string setup after initialization', function() {
    encoder.setColor('#444444', 'hex').color.should.exist;
  });

  it('should encode a valid color', function(done) {
    encoder.encode().should.eventually.be.an.instanceof(Array).notify(done);
  });

  it('should retrieve all results when asked', function(done) {
    encoder.encode(true).should.eventually.have.length.within(1, Infinity).notify(done);
  });

  it('should error when the color cannot be encoded', function(done) {
    encoder.setColor('#FFFFFF', 'hex');
    encoder.encode().should.be.rejected.notify(done);
  });

  it('should return closest encodable color when asked', function(done) {
    encoder.setColor('#FFFFFF', 'hex');
    encoder.encode(true, true).should.eventually.have.length.above(0).notify(done);
  });

  it('should reject invalid colors', function(done) {
    encoder.setColor([300, 300, 300], 'rgb');
    encoder.encode().should.be.rejected.notify(done);
  });

  after(function() {
    fs.unlinkSync(DB_PATH);
    fs.rmdirSync(path.dirname(DB_PATH));
  });

});
