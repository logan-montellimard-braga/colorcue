var chai   = require('chai');
var should = chai.should();

var WordScoreCalculator = require('../../lib/words/WordScoreCalculator').default;

var MAX_SCORE = Math.floor(Math.random() * 1000);
var MIN_SCORE = 0;

var calculator = new WordScoreCalculator(MIN_SCORE, MAX_SCORE);

describe('Mapper from words to scores', function() {

  it('should encode a word into an integer', function() {
    var score = calculator.calculate('dog');
    score.should.be.a('number');
  });

  it('should encode a word within given ranges', function() {
    var score = calculator.calculate('foobar');
    score.should.be.within(MIN_SCORE, MAX_SCORE);
  });

  it('should be case insensitive by default', function() {
    var score1 = calculator.calculate('foobar');
    var score2 = calculator.calculate('FoObaR');

    score1.should.equal(score2);
  });

  it('should be case sensitive when asked', function() {
    var calculator = new WordScoreCalculator(MIN_SCORE, MAX_SCORE, {lowercase: false});
    var score1 = calculator.calculate('foobar');
    var score2 = calculator.calculate('FoObaR');

    score1.should.not.equal(score2);
  });

});
