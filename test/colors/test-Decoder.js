var chai   = require('chai');
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var Color = require('../../lib/colors/Color').default;
var Decoder = require('../../lib/colors/Decoder').default;
var decoder = new Decoder();

describe('Decoder', function() {

  it('should reject use without string setup', function(done) {
    decoder.decode().should.be.rejected.notify(done);
  });

  it('should allow string setup after initialization', function() {
    decoder.setInput('rosewood bundles').words.should.exist;
  });

  it('should decode a valid tuple', function(done) {
    decoder.setInput('rosewood bundles');
    decoder.decode().should.eventually.be.an.instanceof(Color).notify(done);
  });

  it('should reject a tuple with two descriptors', function(done) {
    decoder.setInput('red red');
    decoder.decode().should.be.rejected.notify(done);
  });

  it('should reject not-2-word tuples', function(done) {
    decoder.setInput('oneWordOnly');
    decoder.decode().should.be.rejected.notify(done);
  });

  it('should reject tuples with numbers', function(done) {
    decoder.setInput('1234 numbers1234');
    decoder.decode().should.be.rejected.notify(done);
  });

  it('should reject tuples with two normal words', function(done) {
    decoder.setInput('foo bar');
    decoder.decode().should.be.rejected.notify(done);
  });

});
