var chai   = require('chai');
var should = chai.should();
var path   = require('path');
var os     = require('os');
var fs     = require('fs');

var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var Initializer = require('../../lib/database/Initializer').default;
var DataCleaner = require('../../lib/database/DataCleaner').default;
var Encoder     = require('../../lib/colors/Encoder').default;
var Decoder     = require('../../lib/colors/Decoder').default;

var DB_PATH = path.join(os.tmpdir(), 'colorcue', 'test-db.data');
var DATA_PATH = 'test/data/data.txt';

var encoder = new Encoder(DB_PATH);
var decoder = new Decoder();

describe('Encoder/Decoder roundtrip', function() {

  before(function(done) {
    var init = new Initializer(DB_PATH).setUp();
    var cleaner = new DataCleaner(DATA_PATH);
    cleaner.cleanup().then(function(data) {
      init.populateWith(data)
        .then(function() { done(); });
    });
  });

  it('should return the same color after encoding and decoding', function(done) {
    var hslColor = [Math.floor(Math.random() * 360), 9, 91];
    encoder.setColor(hslColor, 'hsl');
    encoder.encode().then(function(tuple) {
      decoder.setInput(tuple[0]);
      decoder.decode().then(function(decoded) {
        decoded.color.should.deep.equal(hslColor);
      }).should.be.fulfilled;
    }).should.be.fulfilled.notify(done);
  });

  after(function() {
    fs.unlinkSync(DB_PATH);
    fs.rmdirSync(path.dirname(DB_PATH));
  });

});
