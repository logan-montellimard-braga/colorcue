/**
 * @module database
 */

import DBAccessor  from "+/database/DBAccessor";

/**
 * Class to check if a words database has sufficient capability to encode any
 * given color.
 *
 * @class
 * @see DBAccessor
 */
class DataChecker extends DBAccessor {

  /**
   * @public
   * @constructor
   * @verride
   * @param {String} dbPath
   */
  constructor(dbPath) {
    super(dbPath);
  }

  /**
   * Check the capacity of the database by counting the number of distinct
   * scores, the amplitude of words per score, and the effective size of the
   * data.
   *
   * @public
   * @returns {Promise} A promise that returns the verification report when resolved.
   */
  check() {
    let frequencies = [];
    let max = 0;
    let min = Infinity;
    let wordsNumber = 0;
    let maxNScore = 0;
    let minNScore = Infinity;

    return this._eachEntry((entry) => {
      const score = entry[0];
      wordsNumber++;
      if (score > max) { max = score; }
      if (score < min) { min = score; }
      if (frequencies[score] !== undefined) {
        frequencies[score] = frequencies[score] + 1;
      } else { frequencies[score] = 1; }
      if (frequencies[score] > maxNScore) { maxNScore = frequencies[score]; }
      if (frequencies[score] < minNScore) { minNScore = frequencies[score]; }
    })
    .then(() => {
      return {
        scores: frequencies.length,
        words: wordsNumber,
        max: max,
        min: min,
        maxNScore: maxNScore,
        minNScore: minNScore
      };
    });
  }

}
export default DataChecker;
