var chai   = require('chai');
var should = chai.should();

var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var DataCleaner = require('../../lib/database/DataCleaner').default;
var DATA_PATH = 'test/data/data.txt';

describe('Data cleaner', function() {

  it('should cleanup given data', function() {
    var cleaner = new DataCleaner(DATA_PATH);
    cleaner.cleanup().then(function(data) {
      done();
    });
  });

});
