/**
 * @module database
 */

import DBAccessor from "+/database/DBAccessor";

import sp from "child_process";

/**
 * Class to seek words from the database.
 *
 * @class
 * @see DBAcessor
 */
class Finder extends DBAccessor {

  /**
   * @override
   * @public
   * @constructor
   * @param {String} dbPath
   */
  constructor(dbPath) {
    super(dbPath);
  }

  /**
   * Retrieve all words associated with the given numeric score from the
   * database.
   * If no words are found, the promise is rejected with a 'NOWORDS' error code.
   *
   * @public
   * @param {Number} score
   * @returns {Promise} A promise returning the array of results when resolved.
   */
  getAllWordsByScore(score, tryGrep = true) {
    if (tryGrep) {
      const regex = `^${score}${this.separator}`;
      return this._tryGrepping(score, regex);
    }

    let results = [];
    return this._eachEntry((entry) => {
      if (entry[0] === score) {
        const word = entry[1];
        results.push(word);
      }
    })
    .then(() => {
      if (results.length === 0) { return Promise.reject({code: 'NOWORDS'}); }
      return results;
    });
  }

  /**
   * Try to retrieve the words by using grep/findstr (windows).
   * If the command fails, fall back on manual searching.
   *
   * @private
   * @param {Number} score
   * @param {String} regex
   * @returns {Promise}
   */
  _tryGrepping(score, regex) {
    let command = process.platform === 'win32' ? 'findstr' : 'grep';

    return new Promise((resolve, reject) => {
      sp.exec(`${command} '${regex}' "${this.dbPath}"`, (err, res) => {
        if (err) { reject(); }
        else {
          let lines = res.split(/\r*\n/);
          lines = lines.slice(0, lines.length - 1);
          resolve(lines.map((l) => {
            return l.split(this.separator)[1];
          }));
        }
      });
    })
    .catch(() => {
      return this.getAllWordsByScore(score, false);
    });
  }

  /**
   * Retrieve one word associated with the given numeric score from the
   * database.
   * This method uses getAllWordsByScore(score) to retrieve all words, and then
   * constructs a weighted list based on the length of the words (the shorter
   * a word is, the more chances it has to be picked up) and randomly select
   * an element from it.
   *
   * @public
   * @param {Number} score
   * @returns {Promise} A promise returning the result when resolved.
   */
  getOneWordByScore(score) {
    return this.getAllWordsByScore(score)
      .then(words => {
        if (words.length === 0) { return null; }
        if (words.length > 1) {
          return weightedRandom(this._buildWeightedList(words));
        } else { return words[0]; }
      });
  }

  /**
   * Return the nearest word associated to the given numeric score from the
   * database.
   * This method is used when the database has not enough words to encode any
   * possible score, and the wanted score cannot be found. It insteads searches
   * for the closest score it can find, and returns the first word associated
   * with it.
   *
   * @public
   * @param {Number} score
   * @returns {Promise} A promise returning the result when resolved.
   */
  getClosestWordByScore(score) {
    return this._allData().then((data) => {
      let minDiff = [Infinity, null];
      for (const [s, word] of data) {
        let diff = Math.abs(score - s);
        if (diff === 1) { return word; }
        if (diff < minDiff[0]) {
          minDiff[0] = diff;
          minDiff[1] = word;
        }
      }

      if (minDiff[1]) { return minDiff[1]; }
      return Promise.reject({code: 'NOWORDS'});
    });
  }

  /**
   * Construct a weighted list of the given elements by their length.
   *
   * @private
   * @param {Array.String} words
   * @returns {Array} Array in the form [element, weight].
   */
  _buildWeightedList(words) {
    const sorted = words.sort((a, b) => { return b.length - a.length; });
    const longuest = sorted[0].length;
    return sorted.reverse().map((word) => {
      return [word, Math.pow(longuest, 2) + longuest - Math.pow(word.length, 2)];
    });
  }

}
export default Finder;

/**
 * Randomly select an element from a weighted list of choices.
 * The sum of the weights can exceed 1.
 *
 * @param {Array} weightedChoices - The weighted choices in the form [element, weight]
 * @returns {String} The selected element
 */
function weightedRandom(weightedChoices) {
  let sum = 0;
  for (const [_, weight] of weightedChoices) { sum += weight; }
  let rand = Math.random() * sum;
  sum = 0;

  for (const [element, weight] of weightedChoices) {
    sum += weight;
    if (rand <= sum) { return element; }
  }
}
