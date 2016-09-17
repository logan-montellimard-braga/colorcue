/**
 * @module database
 */

import fs       from "fs";
import readLine from "readline";
import mkdirp   from "mkdirp";
import path     from "path";

/**
 * Contains the cached data from the database.
 *
 * @private
 * @type {Array}
 */
let _dataCache = [];

/**
 * Abstract class representing an entity that can connect to a database,
 * caching results if possible.
 *
 * @abstract
 * @class
 */
class DBAccessor {

  /**
   * Instantiate the entity with the path to the database to access.
   *
   * @public
   * @constructor
   * @abstract
   * @param {String} dbPath
   * @throw Exception if the class is directrly instantiated.
   */
  constructor(dbPath, separator = ',') {
    if (this.constructor === DBAccessor) {
      throw 'Abstract class DBAccessor cannot be directly instantiated.';
    }
    this.dbPath = dbPath;
    this.setup = false;
    this.separator = separator;
  }

  /**
   * Set up the accessor by opening the database, ensuring the parent folders
   * are created if the database does not already exists.
   * Side effects that should not be done in the constructor should be put here
   * for inherited classes.
   *
   * @public
   * @returns {Promise} A promise returning nothing when resolved.
   */
  setUp() {
    mkdirp.sync(path.dirname(this.dbPath));
    this.setup = true;
    return this;
  }

  /**
   * Iterate with the given function over the data from databse.
   * If useCache is true, use data from the cache if available.
   *
   * @protected
   * @param {Function} callback
   * @param {Boolean} useCache
   * @returns {Promise}
   */
  _eachEntry(callback, useCache = true) {
    if (_dataCache.length > 0 && useCache) {
      for (const d of _dataCache) {
        callback(d);
      }
      return Promise.resolve();
    }

    const reader = readLine.createInterface({
      input: fs.createReadStream(this.dbPath)
    });

    return new Promise((resolve, reject) => {
      reader.on('line', (line) => {
        let e = line.split(this.separator);
        e[0] = parseInt(e[0], 10);
        _dataCache.push(e);
        callback(e);
      });
      reader.on('error', (err) => { reject(err); });
      reader.on('close', () => { resolve(); });
    });
  }

  /**
   * Simple wrapper around _eachEntry to retrieve all data, using cache if
   * available and useCache is set to true.
   *
   * @protected
   * @param {Boolean} useCache
   * @returns {Promise}
   */
  _allData(useCache = true) {
    if (_dataCache.length && useCache) { return Promise.resolve(_dataCache); }

    return this._eachEntry(() => {}, useCache)
    .then(() => {
      return _dataCache;
    });
  }

}
export default DBAccessor;
