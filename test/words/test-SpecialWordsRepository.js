var chai   = require('chai');
var should = chai.should();

var SpecialWordsRepository = require('../../lib/words/SpecialWordsRepository').default;

describe('Repository for special words', function() {

  it('should reject direct instantiation', function() {
    (function() { new SpecialWordsRepository() }).should.throw();
  });

  it('should return a unique instance', function() {
    var repo = SpecialWordsRepository.instance;
    var repo2 = SpecialWordsRepository.instance;

    repo.should.be.an.instanceof(SpecialWordsRepository);
    repo.should.equal(repo2);
  });

  it('should return an array of strings', function() {
    var words = SpecialWordsRepository.instance.words;
    words.should.be.an.instanceof(Array);
    words[0].should.be.a('string');
  });

  it('should test for case-insensitive inclusion', function() {
    var words = SpecialWordsRepository.instance.words;
    var word = words[Math.floor(Math.random() * words.length - 1)];

    SpecialWordsRepository.instance.includes(word).should.be.true;
    SpecialWordsRepository.instance.includes(word.toUpperCase()).should.be.true;
    SpecialWordsRepository.instance.includes(word.toLowerCase()).should.be.true;
  });

});
