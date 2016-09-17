/**
 * @module database
 */

import SpecialWordsRepository from "+/words/SpecialWordsRepository";

import readLine from "readline";
import fs       from "fs";

/**
 * Repository of reserved words.
 *
 * @constant
 * @type {SpecialWordsRepository}
 * @see SpecialWordsRepository
 */
const reservedWords = SpecialWordsRepository.instance;

/**
 * Object of rejection functions to cleanup the data.
 * Each function must return true if the input should be rejected.
 *
 * @constant
 * @type {Object}
 */
const rules = {

  empty(word) {
    return word.length === 0 || /^\s+$/.test(word);
  },

  tooShort(word) {
    return word.length < 2;
  },

  abbreviation(word) {
    return word.split('').every((chr) => {
      return chr === chr.toUpperCase();
    });
  },

  specialChars(word) {
    return !(/^[A-Za-z\u00C0-\u017F]+$/.test(word));
  },

  reserved(word) {
    return reservedWords.includes(word);
  }

};

/**
 * Class to clean up a data file before using it.
 *
 * @class
 */
class DataCleaner {

  /**
   * Instantiate with the path to the data file, and an optional array of
   * names of rejection rules to disabled during cleanup.
   *
   * @constructor
   * @public
   * @param {String} filename - The datafile to be cleaned
   * @param {Array.String} disabledRules - List of rejection rules not to apply
   */
  constructor(filename, disabledRules = []) {
    this.filename = filename;
    this._data = [];

    if (disabledRules.includes('ALL')) {
      this.rules = {reserved: rules.reserved};
    } else {
      disabledRules.map(rule => {
        if (rule !== 'reserved') { delete(rules[rule]); }
      });
      this.rules = rules;
    }
  }

  /**
   * @public
   * @returns {Array.String} The cleaned data, or an empty array if cleanup has 
   *                         not yet started.
   */
  get data() {
    return this._data;
  }

  /**
   * Clean up the data file by reading it line by line and applying every
   * rejection rules on them, rejecting the line if any function returns true.
   *
   * @public
   * @returns {Promise} A promise returning the cleaned data array when resolved.
   */
  cleanup() {
    const reader = readLine.createInterface({
      input: fs.createReadStream(this.filename)
    });

    reader.on('line', line => {
      let ok = true;
      for (const rule in this.rules) {
        if (this.rules[rule](line)) {
          ok = false;
          break;
        }
      }
      if (ok) { this.data.push(line); }
    });

    return new Promise((resolve, reject) => {
      reader.on('close', () => resolve(this.data));
      reader.on('SIGINT', () => reject('SIGINT'));
    });
  }

}
export default DataCleaner;
