var chai   = require('chai');
var should = chai.should();

var tupleToInt = require('../../../lib/colors/utils/tupleToInt');

var MAX_VALUE = 100;
var MAX_NUMBER = Math.pow(MAX_VALUE + 1, 2);

describe('Tuple of integers to a single integer and back', function() {

  it('should encode a tuple into a number', function() {
    var x = Math.floor(Math.random() * MAX_VALUE);
    var y = Math.floor(Math.random() * MAX_VALUE);

    var result = tupleToInt.encode([x, y], MAX_VALUE);
    result.should.be.a('number');
    result.should.be.within(0, MAX_NUMBER);
  });

  it('should decode a number into a tuple', function() {
    var number = Math.floor(Math.random() * MAX_NUMBER);

    var result = tupleToInt.decode(number, MAX_VALUE);
    result.should.be.instanceof(Array);
    result.should.have.lengthOf(2);
    var x = result[0], y = result[1];
    x.should.be.within(0, MAX_VALUE);
    x.should.be.a('number');
    (x % 1).should.equal(0);
    y.should.be.within(0, MAX_VALUE);
    y.should.be.a('number');
    (y % 1).should.equal(0);
  });

  it('should get the same numbers after a roundtrip', function() {
    var x = Math.floor(Math.random() * MAX_VALUE);
    var y = Math.floor(Math.random() * MAX_VALUE);
    var encoded = tupleToInt.encode([x, y], MAX_VALUE);

    var decoded = tupleToInt.decode(encoded, MAX_VALUE);

    x.should.be.equal(decoded[0]);
    y.should.be.equal(decoded[1]);
  });

  it('should reject tuples not in range for encoding', function() {
    var x = y = MAX_VALUE * 2;

    (function() { tupleToInt.encode([x, y], MAX_VALUE) }).should.throw();
  });

  it('should reject numbers not in range for decoding', function() {
    var x = MAX_NUMBER + 1;

    (function() { tupleToInt.decode(x, MAX_VALUE) }).should.throw();
  });

});
