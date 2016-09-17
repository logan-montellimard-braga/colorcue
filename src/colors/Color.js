/**
 * @module colors
 */

import cc          from "color-convert";
import cssKeywords from "color-convert/css-keywords";

/**
 * Default mode to represent colors internally.
 *
 * @constant
 * @default
 * @type {String}
 */
const DEFAULT_MODE = 'hsl';

/**
 * Wrapper class around the color-convert library, to represent a color
 * (internally in rounded HSL format) that can be decomposed into its channels
 * and components, and can be formated to other known color formats.
 *
 * @class
 */
class Color {

  /**
   * Instantiate the color in the given mode. If the mode differs from the
   * default mode, a potentially-lossy conversion is attempted.
   * No checking of the validity of the resulting color is made at this point.
   *
   * @constructor
   * @public
   * @param {String|Array.Number} color - The color to represent
   * @param {String} mode - The format the color is in
   */
  constructor(color, mode = DEFAULT_MODE) {
    this.color = null;
    if (mode === DEFAULT_MODE) {
      this.color = color;
    } else {
      if (Color.modes.includes(mode)) {
        if (mode === 'keyword' && !Color.cssColors.includes(color)) {
          this.color = null;
        } else if (mode === 'hex' && !/^#?[a-f0-9]{6}$/i.test(color)){
          this.color = null;
        } else {
          this.color = cc[mode].hsl(color);
        }
      }
    }
  }

  /**
   * Check that the current color is in a valid internal state.
   * The verification is done by checking that every channel is a positive
   * integer in the possible ranges defined by the color representation used
   * internally.
   *
   * @public
   * @returns {Boolean}
   */
  isValid() {
    if (!this.color || this.color.length !== 3) { return false; }
    return this.color.every((channel, idx) => {
      let validRange = true;
      if (idx === 0) { validRange = channel <= 360; }
      else { validRange = channel <= 100; }
      return (Number.isFinite(channel) && channel >= 0 && validRange);
    });
  }

  /**
   * Convert the current color to the given color mode.
   *
   * @public
   * @param {String} mode
   * @returns {String|Array|Number} The converted color, raw, or null if the mode
   * is not recognized.
   */
  to(mode) {
    if (mode === DEFAULT_MODE) { return this.color; }
    if (Color.modes.includes(mode)) {
      return cc[DEFAULT_MODE][mode](this.color);
    }
    return null;
  }

  /**
   * Format the current color to the given mode, converting it if needed.
   *
   * @public
   * @param {String} mode
   * @returns {String}
   * @see Color.pureFormat()
   */
  format(mode) {
    return Color.pureFormat(this.to(mode), mode);
  }

  /**
   * Format the given color to the given mode, in a user-friendly representation.
   * This method does not proceed to any color conversion; the mode parameter
   * is only used to render the representation.
   *
   * @static
   * @public
   * @param {String|Number|Array} color - The color to format
   * @param {String} mode - The mode to format the color to
   * @returns {String} The string representation of the formated color
   * @throw Error if the color mode is not recognized.
   */
  static pureFormat(color, mode) {
    mode = mode.toLowerCase();
    switch (mode) {
      case 'rgb':
      case 'hsl':
      case 'hsv':
      case 'hwb':
      case 'cmyk':
      case 'xyz':
      case 'lab':
      case 'lch':
      case 'hcg':
      case 'apple':
        return `${mode}(${color.join(', ')})`;
      case 'hex':
        if (color.indexOf('#') === 0) { return color; }
        return `#${color}`;
      case 'keyword':
      case 'ansi16':
      case 'ansi256':
        return String(color);
    }

    throw 'Invalid color format.';
  }

  /**
   * Return the supported color modes.
   *
   * @public
   * @static
   * @returns {Array.String}
   */
  static get modes() {
    return [
      'rgb', 'hsl', 'hsv', 'hwb', 'cmyk', 'xyz', 'lab', 'lch', 'hex', 'keyword',
      'ansi16', 'ansi256', 'hcg', 'apple'
    ].sort();
  }

  /**
   * Return the maximum number of saturation-luminosity values.
   *
   * @public
   * @static
   * @returns {Number}
   */
  static get maxSLTuple() {
    const possibleSaturationValues = 101;
    const possibleLuminosityValues = 101;
    return possibleSaturationValues * possibleLuminosityValues;
  }

  /**
   * Return the hue channel of the color, in the range [0, 360].
   *
   * @public
   * @returns {Number}
  */
  get hue() {
    return this.color[0];
  }

  /**
   * Return the saturation channel of the color, in the range [0, 100].
   *
   * @public
   * @returns {Number}
  */
  get saturation() {
    return this.color[1];
  }

  /**
   * Return the luminosity channel of the color, in the range [0, 100].
   *
   * @public
   * @returns {Number}
   */
  get luminosity() {
    return this.color[2];
  }

  /**
   * Return the list of all known CSS colors keywords.
   *
   * @static
   * @public
   * @returns {Array.String}
   */
  static get cssColors() {
    return Object.keys(cssKeywords);
  }

}
export default Color;
