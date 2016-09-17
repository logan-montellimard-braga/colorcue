/**
 * Global constants.
 *
 * @module constants
 */

/**
 * Global constants used throughout the application.
 *
 * @global
 * @constant
 * @type {Object}
 */
const constants = {
  /**
   * 'Magic' number for the whole algorithm. Represents half of the possible
   * values to encode the saturation/luminosity tuple of an HSL color, plus one,
   * and thus the number of different scores (from 0 to this number) needed in
   * a words database to encode any given color.
   *
   * @constant
   * @default
   * @type {Number}
   */
  pivot: 5102
};
global.constants = constants;
export default constants;
