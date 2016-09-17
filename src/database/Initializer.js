/**
 * @module database
 */

import DBAccessor          from "+/database/DBAccessor";
import WordScoreCalculator from "+/words/WordScoreCalculator";

import fs from "fs";

/**
 * Class to initialize and populate a newly created database with appropriate
 * data.
 *
 * @see DBAccessor
 * @see WordScoreCalculator
 */
class Initializer extends DBAccessor {

  /**
   * @public
   * @override
   * @constructor
   * @param {String} dbPath
   */
  constructor(dbPath) {
    super(dbPath);
  }

  /**
   * Populate the database with the given data, usually first cleaned-up.
   *
   * @public
   * @param {Array.String} data
   * @returns {Promise}
   */
  populateWith(data) {
    if (!this.setup) {
      throw 'Initializer must be set up before populating the database.';
    }

    const wordScoreMapping = this._sortData(this._mapWordsToScores(data));
    data = null;

    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(this.dbPath);

      stream.on('error', (err) => { reject(err); });
      stream.on('close', () => { resolve(this); });
      stream.once('open', () => {
        for (const tuple of wordScoreMapping) {
          stream.write(`${tuple.score},${tuple.word}\n`);
        }
        stream.end();
      });
    });
  }

  /**
   * Associate each word in the given array to its score.
   *
   * @private
   * @param {Array.String} words
   * @returns {Array}
   */
  _mapWordsToScores(words) {
    const scorer = new WordScoreCalculator(0, global.constants.pivot);
    return words.map(word => {
      return {word: word, score: scorer.calculate(word)};
    });
  }

  _sortData(data) {
    return data.sort((a, b) => {
      return a.score < b.score ? (a.score === b.score ? 0 : -1) : 1;
    });
  }

}
export default Initializer;
