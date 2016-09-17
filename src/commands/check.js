/**
 * @module commands
 */

import DataChecker   from "+/database/DataChecker";
import DB_PATH       from "+/commands/utils/dataPath";
import print, * as p from "+/commands/utils/printing";

import fs from "fs";

/**
 * Minimum number of different word scores, from 0 to this value, needed in the
 * database for the test to pass.
 *
 * @constant
 * @default
 * @see constants.js
 * @type {Number}
 */
const NUMBER_OF_SCORES_NEEDED = global.constants.pivot;

/**
 * Check the viability of the given database and print the report.
 * Program is exited with an error status code if the check failed, 0 otherwise.
 *
 * @param {String} database - The path of the database to check
 * @see DataChecker
 */
function check(database) {
  const input = database || DB_PATH;

  fs.stat(input, (err, stats) => {
    if (err || stats.isDirectory()) {
      print(`Failed to open database \`${p.em(input)}\`.`, p.ERROR);
      print(p.systemError(err ? err.code : 'EISDIR'), p.ERROR);
      process.exit(1);
    }

    const checker = new DataChecker(input);
    checker
      .setUp()
      .check()
      .then((data) => {
        print(`Tests ran successfully on database \`${p.em(input)}\`.`, p.SUCCESS);
        print(generateReport(data), p.NORMAL);

        if (data.scores < NUMBER_OF_SCORES_NEEDED) {
          print('Not enough words.', p.INFO);
          process.exit(1);
        } else {
          print('Enough words. Congrats!', p.INFO);
        }
      })
      .catch((err) => {
        print(err.message ? err.message : err, p.ERROR);
        process.exit(1);
      });
  });
}
export default check;

/**
 * Generate a formatted report from the given stats about the database.
 *
 * @private
 * @param {Object} data
 * @returns {String} The formatted report
 */
function generateReport(data) {
  const avg = +(data.words / NUMBER_OF_SCORES_NEEDED).toFixed(2);
  return `
Number of words            : ${data.words}
Number of scores           : ${data.scores}
Number of required scores  : ${NUMBER_OF_SCORES_NEEDED}
Words per (required) score : ~${avg} ([${data.minNScore},${data.maxNScore}])
  `;
}
