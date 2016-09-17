var chai   = require('chai');
var should = chai.should();

var DBAccessor = require('../../lib/database/DBAccessor').default;

describe('DBAccessor', function() {

  it('should not be directrly instantiated', function() {
    (function() { new DBAccessor(''); }).should.throw;
  });

});
