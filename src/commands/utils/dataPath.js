/**
 * @module commands/utils
 */

/**
 * Default path for the local database.
 *
 * @constant
 * @default
 * @type {String}
 */
const DB_PATH = generateDataPath() + '/db.data';
export default DB_PATH;

/**
 * Determine the data directory for the application, based on the operating
 * system.
 * Windows: APPDATA path variable
 * OSX: $HOME/Library/Preferences/colorcue
 * Linux: $HOME/.local/share/colorcue
 *
 * @private
 * @returns {String} - The data folder for the application.
 */
function generateDataPath() {
  let dp = null;

  if (process.env.APPDATA) {
    dp = process.env.APPDATA;
  } else if (process.platform === 'darwin') {
    dp = process.env.HOME + 'Library/Preferences/colorcue';
  } else {
    dp = process.env.HOME + '/.local/share/colorcue';
  }

  return dp;
}
