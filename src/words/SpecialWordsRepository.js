/**
 * @module words
 */

import fs from "fs";

/**
 * Unique symbols used to make class properties pseudo-private.
 *
 * @constant
 */
const singleton = Symbol(),
      enforcer = Symbol();

/**
 * Location of data file to fill the repository.
 *
 * @constant
 * @type {String}
 */
const WORDS_PATH = __dirname + "/../../data/colors.data";

/**
 * Singleton class to manage a list of special, statically predefined words.
 * Class is accessed at all times with SpecialWordsRepository.instance to get
 * the singleton instance.
 * This class cannot be instantiated from the outside.
 *
 * @class
 */
class SpecialWordsRepository {

  /**
   * Private constructor. Will reject any outisde attempt.
   *
   * @constructor
   * @private
   * @param {Symbol} e - The unique symbol used to instantiate from inside.
   * @throws Exception if called from outside the class
   */
  constructor(e) {
    if (e !== enforcer) { throw "Singleton instanciation error"; }
  }

  /**
   * Class method to return the one and only instance of the repository, 
   * creating it first if needed.
   *
   * @public
   * @static
   * @returns {SpecialWordsRepository} Instance of repository
   */
  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new SpecialWordsRepository(enforcer);
      this[singleton]._words = this._loadWords();
    }

    return this[singleton];
  }

  /**
   * @public
   * @returns {Array} The list of special words loaded in this repository.
   */
  get words() {
    return this._words;
  }

  /**
   * Test if a given word is contained in this repository.
   * This is a case-insensitive check.
   *
   * @public
   * @returns {Boolean}
   */
  includes(word) {
    word = word.toLowerCase();
    return this.words.some((el) => {
      if (word === el.toLowerCase()) { return true; }
    });
  }

  /**
   * Read the datafile, filtering comments and empty lines, and returns the
   * resulting list of words.
   *
   * @private
   * @static
   * @returns {Array} The filtered list of words in the datafile.
   */
  static _loadWords() {
    const lineEndingRegex = /\r\n|[\n\v\f\r\x85\u2028\u2029]/;
    const words = fs
      .readFileSync(WORDS_PATH, 'utf-8')
      .toString()
      .split(lineEndingRegex);

    return words.filter(word => {
      if ('' === word) { return false; }
      return !(/^\s*#/.test(word));
    });
  }

}
export default SpecialWordsRepository;
