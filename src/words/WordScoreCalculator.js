/**
 * @module words
 */

import SpecialWordsRepository from "+/words/SpecialWordsRepository";

/**
 * Indicates the start of lowercase letters in the ascii table.
 *
 * @constant
 */
const ASCII_START_LETTERS = 97;

/**
 * Class to associate any given word to a calculated score between predetermined
 * boundaries.
 *
 * @class
 */
class WordScoreCalculator {

  /**
   * @constructor
   * @public
   * @param {Number} minScore - Minimum score to return when calculating
   * @param {Number} maxScore - Maximum score to return when calculating
   *                            (modulo is applied if overflow)
   * @param {Object} opts - Options. 'lowercase' makes the score calculation
   *                        case insensitive. 'startIndex' is used internally.
   */
  constructor(minScore = 0, maxScore = Infinity, opts = {}) {
    this.min = minScore;
    this.max = maxScore;

    const defaults = {
      startIndex: ASCII_START_LETTERS,
      lowercase: true
    };
    this.opts = Object.assign(defaults, opts);
  }

  /**
   * Calculate an integer score from a given word.
   * Score is obtained by getting the position in the latin alphabet of each
   * letter, multiplying that position by the position of the letter in the word
   * (starting at startIndex, which is a magic value determined for optimal
   * distribution), and then summing all the values.
   * The minimum score value is added, and the whole is modulo'd if the result
   * is greater than the max score value specified in the constructor.
   *
   * This method works on both strings and arrays of strings.
   *
   * @public
   * @param {(String|Array.String)} word - The word(s) from which to calculaate
   *                                       a score
   * @returns {Number} - The calculated score
   */
  calculate(word = '') {
    if (Array.isArray(word)) { return word.map(w => this.calculate(w)); }

    this._checkReservedWord(word);

    const chars = (this.opts.lowercase ? word.toLowerCase() : word).split('');
    const score = chars.reduce((sum, chr, idx) => {
      const alphabetPosition = chr.charCodeAt(0) - ASCII_START_LETTERS;
      const paddedIndex = idx + this.opts.startIndex;
      return sum + alphabetPosition * paddedIndex;
    }, 0);

    return (this.min + score) % this.max;
  }

  /**
   * Ensure that the given word is not a reserved word.
   *
   * @private
   * @param {String} word - The word to check
   * @throw Exception if the word is contained in the special words repository.
   * @see SpecialWordsRepository
   */
  _checkReservedWord(word) {
    if (SpecialWordsRepository.instance.includes(word)) {
      throw 'Trying to calculate the score of a reserved word.';
    }
  }

}
export default WordScoreCalculator;
