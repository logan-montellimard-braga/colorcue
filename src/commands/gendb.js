/**
 * @module commands
 */

import Initializer   from "+/database/Initializer";
import DataCleaner   from "+/database/DataCleaner";
import DB_PATH       from "+/commands/utils/dataPath";
import print, * as p from "+/commands/utils/printing";

import fs     from "fs";

/**
 *
 * @param {String} dataFile - The data file path to populate the databse with
 * @param {Object} opts - Command-line options. 'output' sets the (non-default)
 * generated database path. 'disabledRules' list the cleaning rules to disable
 * @see DataCleaner
 * @see Initializer
 */
function gendb(dataFile, opts) {
  const output = opts.outputFile || DB_PATH;
  const disabledRules = opts.disableRules ? opts.disableRules.split(',') : [];

  fs.stat(dataFile, (err, stats) => {
    if (err || stats.isDirectory()) {
      print(`Failed to open \`${p.em(dataFile)}\`.`, p.ERROR);
      print(p.systemError(err ? err.code : 'EISDIR'), p.ERROR);
      process.exit(1);
    }

    fs.stat(output, (err, stats) => {
      if (err && err.code !== 'ENOENT') {
        print(`Failed to write to \`${p.em(output)}\`.`, p.ERROR);
        print(p.systemError(err.code), p.ERROR);
        process.exit(1);
      }
      if (stats) {
        if (stats.isDirectory()) {
          print(`Failed to write to \`${p.em(output)}\`.`, p.ERROR);
          print(p.systemError('EISDIR'), p.ERROR);
          process.exit(1);
        }
        let message = `File \`${p.em(output)}\` already exists.`;
        if (!opts.force) {
          print(message, p.ERROR);
          print(`Use ${p.em('-f')} or ${p.em('--force')} to override.`, p.ERROR);
          process.exit(1);
        }
        else { print(message + ' Overriding...', p.INFO); }
      }
      __gendb();
    });
  });

  /**
   * Generate the database.
   *
   * @private
   */
  function __gendb() {
    const initializer = new Initializer(output);
    const cleaner = new DataCleaner(dataFile, disabledRules);

    print('Cleaning data before insertion...', p.INFO);
    cleaner
      .cleanup()
      .then((data) => {
        print(`Populating database with ${p.em(data.length)} words. This may take a while...`, p.INFO);
        initializer
          .setUp()
          .populateWith(data)
          .then(() => {
            print(`Database successfully generated at \`${p.em(output)}\`.`, p.SUCCESS);
          });
      })
      .catch((err) => {
        print(err.message ? err.message : err, p.ERROR);
        process.exit(1);
      });
  }
}
export default gendb;
