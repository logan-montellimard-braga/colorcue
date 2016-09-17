var chai   = require('chai');
var should = chai.should();

var Color = require('../../lib/colors/Color').default;

describe('Color', function() {

  it('should correctly instantiate a valid color', function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    var color = new Color([r, g, b], 'rgb');
    color.isValid().should.be.true;
  });

  it('should accept various color formats', function() {
    var formats = {
      rgb: [255, 0, 0],
      hsl: [0, 100, 50],
      hsv: [0, 100, 100],
      keyword: 'red'
    };
    var colorHex = new Color('#FF0000', 'hex');

    for (format in formats) {
      var color = new Color(formats[format], format);
      color.isValid().should.be.true;
      color.color.should.deep.equal(colorHex.color);
    }
  });

  it('should convert between formats', function() {
    var rgb = [0, 255, 0];
    var hsl = [120, 100, 50];

    var rgbCol = new Color(rgb, 'rgb');
    rgbCol.to('hsl').should.deep.equal(hsl);
  });

  it('should reject invalid colors', function() {
    new Color([300, -9, 19], 'rgb').isValid().should.not.be.true;
    new Color([360, 101, 0], 'hsl').isValid().should.not.be.true;
    new Color('foobar', 'keyword').isValid().should.not.be.true;
    new Color('#zz20fA', 'hex').isValid().should.not.be.true;
  });

  it('should return css keywords', function() {
    var keywords = ['red', 'green', 'blue', 'firebrick', 'goldenrod'];
    var notKeywords = ['dog', 'foobar', 'spaghetti', 'Alice'];

    var cssKeywords = Color.cssColors;
    for (var i = 0, len = keywords.length; i < len; i++) {
      cssKeywords.includes(keywords[i]).should.be.true;
    }
    for (var i = 0, len = notKeywords.length; i < len; i++) {
      cssKeywords.includes(notKeywords[i]).should.not.be.true;
    }
  });

  it('should return hue, saturation and luminosity', function() {
    var black = '#000000';
    var blackColor = new Color(black, 'hex');
    blackColor.saturation.should.equal(0);
    blackColor.luminosity.should.equal(0);

    var randChannels = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    var randColor = new Color(randChannels, 'rgb');
    randColor.hue.should.be.within(0, 360);
    randColor.saturation.should.be.within(0, 100);
    randColor.luminosity.should.be.within(0, 100);
  });

  it('should support basic color modes', function() {
    var modes = ['rgb', 'hex', 'keyword', 'hsl', 'hsv'];
    var colorModes = Color.modes;
    for (var i = 0, len = modes.length; i < len; i++) {
      colorModes.includes(modes[i]).should.be.true;
    }
  });

  it('should string-format the color to the given format', function() {
    var randChannels = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    var randColor = new Color(randChannels, 'rgb');

    randColor.format('rgb').should.match(/rgb\(\d{1,3}(,\s?\d{1,3}){2}\)/);
    randColor.format('hsl').should.match(/hsl\(\d{1,3}(,\s?\d{1,3}){2}\)/);
    randColor.format('hex').should.match(/#?[a-f0-9]{6}/i);
    randColor.format('keyword').should.be.oneOf(Color.cssColors);
  });

});
