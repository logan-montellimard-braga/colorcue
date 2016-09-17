var chai   = require('chai');
var should = chai.should();
var path   = require('path');
var os     = require('os');
var fs     = require('fs');

var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var Initializer = require('../../lib/database/Initializer').default;
var DataCleaner = require('../../lib/database/DataCleaner').default;
var Finder      = require('../../lib/database/Finder').default;

var DB_PATH = path.join(os.tmpdir(), 'colorcue', 'test-db.data');
var DATA_PATH = 'test/data/data.txt';

var finder = new Finder(DB_PATH).setUp();

var impossibleScore = global.constants.pivot + 1;

describe('Finder', function() {

  before(function(done) {
    var init = new Initializer(DB_PATH).setUp();
    var cleaner = new DataCleaner(DATA_PATH);
    cleaner.cleanup().then(function(data) {
      init.populateWith(data)
        .then(function() { done(); });
    });
  });

  it('should retrieve all words matching a given score', function(done) {
    finder.getAllWordsByScore(1000).then(function(words) {
      words.should.be.an.instanceof(Array);
      words.should.have.length.above(0);
    }).should.be.fulfilled.notify(done);
  });

  it('should retrieve one selected word given a score', function(done) {
    finder.getOneWordByScore(1000).then(function(word) {
      word.should.exist;
      word.should.be.a('string');
    }).should.be.fulfilled.notify(done);
  });

  it('should reject scores with no matches', function(done) {
    finder.getAllWordsByScore(impossibleScore).should.be.rejected.notify(done);
  });

  it('should return words with nearest score when asked', function(done) {
    finder.getClosestWordByScore(impossibleScore).then(function(word) {
      word.should.exist;
      word.should.be.a('string');
    }).should.be.fulfilled.notify(done);
  });

  after(function() {
    fs.unlinkSync(DB_PATH);
    fs.rmdirSync(path.dirname(DB_PATH));
  });

});
