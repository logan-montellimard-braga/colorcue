/**
 * @module colors
 */

import SpecialWordsRepository from "+/words/SpecialWordsRepository";
import WordScoreCalculator    from "+/words/WordScoreCalculator";
import Color                  from "+/colors/Color";
import tupleToInt             from "+/colors/utils/tupleToInt";

/**
 * Cache for already decoded colors.
 *
 * @private
 * @type {Object}
 */
let _cachedColors = {};

/**
 * Class to decode a previously-encoded two-word tuple back into its 
 * corresponding color.
 *
 * @class
 * @see Color
 * @see SpecialWordsRepository
 * @see WordScoreCalculator
 */
class Decoder {

  /**
   * Instantiate with the input string to decode. The words can be separated
   * with whitespace characters, dots, underscores or commas.
   * The WordScoreCalculator used throughout the decoding is also instantiated.
   *
   * @constructor
   * @public
   * @param {String} str - The input string to decode
   */
  constructor(str = null) {
    this.ready = false;
    this.wordCalculator = new WordScoreCalculator(0, global.constants.pivot);
    if (str) { this.setInput(str); }
  }

  /**
   * Set the given input string as the string to be worked on.
   *
   * @public
   * @param {String} str
   * @returns {Decoder} The decoder instance
   */
  setInput(str) {
    this.words = str.toLowerCase().split(/[\s_.,]/);
    this.structure = null;
    this.descriptor = null;
    this.word = null;

    this.ready = true;
    return this;
  }

  /**
   * Decode the tuple given on instantiation.
   * Integrity of the tuple is tested at this time. The tuple is rejected if
   * it doesn't follow the [word, descriptor] or [descriptor, word] structure,
   * if it contains digits, or if does not contain exactly two words.
   *
   * @public
   * @returns {Promise} A promise returning the decoded Color when resolved.
   * @see Color
   */
  decode() {
    if (!this.ready) {
      return Promise.reject('Input to decode must be supplied.');
    }
    if (this.words.length !== 2 ||
        this.words.some((e) => { return /\d/.test(e); })) {
      return Promise.reject('Input is not a two-word tuple');
    }

    if (_cachedColors[this.words.join(' ')]) {
      return Promise.resolve(_cachedColors[this.words.join(' ')]);
    }

    return new Promise((resolve, reject) => {
      this.structure = this._determineStructure();
      if (!this.structure[0]) {
        return reject(`Input is invalid: ${this.structure[1]}.`);
      }
      this[this.structure[0]] = this.words[0];
      this[this.structure[1]] = this.words[1];

      const hue = this._getDescriptorValue();
      if (hue < 0) { return reject('Input is invalid.'); }
      const descriptorKind = this._determineDescriptorKind();
      let retCol = null;
      switch (descriptorKind) {
        case 'color':
          let [saturation, luminosity] = this._getWordValues();
          retCol = new Color([hue, saturation, luminosity], 'hsl');
          _cachedColors[this.words.join(' ')] = retCol;
          return resolve(retCol);
        case 'gray':
          luminosity = this.wordCalculator.calculate(this.word);
          retCol = new Color([0, 0, luminosity], 'hsl');
          _cachedColors[this.words.join(' ')] = retCol;
          return resolve(retCol);
      }
    });
  }

  /**
   * Determine the actual structure of the words tuple.
   * The method finds the position of the special descriptor word between the
   * first and second word in the tuple. The other word can be any word.
   *
   * @private
   * @returns {Array.String} The structure of the tuple
   */
  _determineStructure() {
    const special = this.words.map((word) => {
      return SpecialWordsRepository.instance.includes(word);
    });

    if (eqArray(special, [false, true])) {
      return ['word', 'descriptor'];
    } else if (eqArray(special, [true, false])) {
      return ['descriptor', 'word'];
    } else if (eqArray(special, [false, false])) {
      return [false, 'No descriptor word'];
    } else {
      return [false, 'Two descriptor words'];
    }
  }

  /**
   * Determine the actual kind of the descriptor word.
   * If the descriptor word is beyond the HSL hue-range (0-360), its means it's
   * a descriptor for a gray color. If the descriptor is in range, it is a
   * color descriptor.
   * This information is used to find the decoding method of the score of the
   * other word.
   *
   * @private
   * @returns {String}
   */
  _determineDescriptorKind() {
    if (this._getDescriptorValue() > 360) { return 'gray'; }
    return 'color';
  }

  /**
   * Return the hue component of the decoded color, which is obstained by
   * getting the index of the special descriptor words in the array of reserved
   * words.
   *
   * @private
   * @returns {Number}
   */
  _getDescriptorValue() {
    let idx = -1;
    SpecialWordsRepository.instance.words.some((el, i) => {
      if (this.descriptor.toUpperCase() === el.toUpperCase()) {
        idx = i;
        return true;
      }
    });

    return idx;
  }

  /**
   * Return the saturation and luminosity components of the decoded color, which
   * are obtained by decoding the score of the normal word into two numbers.
   *
   * @private
   * @returns {Array.Number}
   */
  _getWordValues() {
    let score = this.wordCalculator.calculate(this.word);

    if (eqArray(this.structure, ['descriptor', 'word'])) {
      score += Math.floor(Color.maxSLTuple / 2);
    }

    return tupleToInt.decode(score, 100);
  }

}
export default Decoder;

/**
 * Utility function to compare two arrays.
 *
 * @param {Array} a
 * @param {Array} b
 * @returns {Boolean} Whether the two arrays are equal
 */
function eqArray(a, b) {
  return a.length === b.length && a.every((e, i) => { return e === b[i]; });
}
