/**
 * @module colors
 */

import SpecialWordsRepository from "+/words/SpecialWordsRepository";
import Color                  from "+/colors/Color";
import Finder                 from "+/database/Finder";
import tupleToInt             from "+/colors/utils/tupleToInt";

/**
 * Class to encode a given color into a two-word tuple.
 *
 * @class
 * @see Color
 * @see Finder
 * @see SpecialWordsRepository
 */
class Encoder {

  /**
   * Instantiate with a color, its mode, and the databse from which to draw
   * words for the encoding.
   * One word of the tuple is a descriptor word that encodes the hue channel of
   * the color, while the other is a "common" word that encodes both the
   * saturation and luminosity channels. Order of the two is significant.
   *
   * @constructor
   * @public
   * @param {String} color - The color to encode
   * @param {String} mode - The mode the color is in
   * @param {String} dbPath - Path to the database
   */
  constructor(dbPath, color = null, mode = null) {
    this.ready = false;
    this.dbPath = dbPath;
    if (color) { this.setColor(color, mode); }
  }

  /**
   * Set the given color as the color to be worked on.
   *
   * @public
   * @param {String} color
   * @param {String} mode
   * @returns {Encoder} The encoder instance
   */
  setColor(color, mode) {
    this.color = new Color(color, mode);
    this.encoding = {};

    this.ready = true;
    return this;
  }

  /**
   * Encode the color given on instantiation.
   * If allResults is true, return all possible combination that can decode back
   * to the color.
   * If findClosest is true, allow potentially high precision lost by finding
   * the nearest color that can be encoded with the current words database.
   *
   * @public
   * @param {Boolean} allResults - Whether to return all results or just one
   * @param {Boolean} findClosest - Whether to return the closest encoding if no
                                    lossless encoding can be done.
   * @returns {Promise} A promise returning the result(s) string when resolved.
   */
  encode(allResults = false, findClosest = false) {
    if (!this.ready) {
      return Promise.reject('Color to encode must be supplied.');
    }
    if (!this.color.isValid()) {
      return Promise.reject('Invalid color or color mode.');
    }

    this.encoding = {
      structure: this._determineStructure(),
      descriptorKind: this._determineDescriptorKind(),
    };
    let descriptor = this._getDescriptor(allResults);

    return this._getWord(allResults, findClosest)
      .then((result) => {
        if (!Array.isArray(result)) { result = [result]; }
        if (!Array.isArray(descriptor)) { descriptor = [descriptor]; }

        return flatten(result.map((word) => {
          return descriptor.map((desc) => {
            if (this.encoding.structure.order[0] === 'word') {
              return `${word} ${desc}`;
            } else {
              return `${desc} ${word}`;
            }
          });
        }));
      });
  }

  /**
   * Determine what structure (first common word then special descriptor word,
   * or the opposite) is needed to encode the color.
   * The split between common word and special descriptor word is done so that
   * out of the 10201 possible values remaining to encode (the hue value is
   * taken care of with the descriptor word), the common word only has to be 
   * able to represent half of them. The structure determines if it is the lower
   * or the upper half.
   *
   * @private
   * @returns {Array.string} The structure needed for encoding
   */
  _determineStructure() {
    const structures = [
      {
        order: ['word', 'descriptor'],
        min: 0,
        max: global.constants.pivot - 1
      },
      {
        order: ['descriptor', 'word'],
        min: global.constants.pivot,
        max: 2 * global.constants.pivot
      }
    ];

    const sat = this.color.saturation;
    const lum = this.color.luminosity;
    const num = tupleToInt.encode([sat, lum], 100);

    if (num < global.constants.pivot) {
      return structures[0];
    }
    else { return structures[1]; }
  }

  /**
   * Determine the kind of descriptor word needed.
   * If the saturation of the color is 0, it means its hue is insignificant, and
   * it is a shade of gray. Otherwise, it is a color.
   *
   * @private
   * @returns {String}
   */
  _determineDescriptorKind() {
    if (this.color.saturation === 0) {
      return 'gray';
    } else {
      return 'color';
    }
  }

  /**
   * Get the descriptor word from the special words repository. The descriptor
   * is retrieved by using the hue of the color as an index.
   *
   * @private
   * @param {Boolean} getAllResults - Whether to get all words or just one
   * @returns {Promise} A promise returning the result(s) when resolved.
   * @see SpecialWordsRepository
   */
  _getDescriptor(getAllResults = false) {
    const words = SpecialWordsRepository.instance.words;
    switch (this.encoding.descriptorKind) {
      case 'color':
        return words[this.color.hue];
      case 'gray':
        if (getAllResults) {
          return words.slice(361);
        } else {
          const rand = Math.floor(Math.random() * (words.length - 361) + 361);
          return words[rand];
        }
    }
  }

  /**
   * Get the common word needed to encode the saturation and luminosity channels
   * of the color.
   * The word is retrieved from database based on its score, the score being
   * a single integer between 0 and 10200 that can be decoded back into 2
   * integers (saturation and luminosity) between 0 and 100.
   * If the color to encode is a gray, only the luminosity channel is used to
   * retrieve the word, as the saturation channel is known in advance to be 0.
   *
   * @private
   * @param {Boolean} getAllResults - Whether to return all results or just one
   * @param {Boolean} findClosest - Whether to return the closest encoding if no
                                    lossless encoding can be done.
   * @returns {Promise} A promise returning the result(s) when resolved.
   */
  _getWord(getAllResults = false, findClosest = false) {
    const sat = this.color.saturation;
    const lum = this.color.luminosity;
    const num = tupleToInt.encode([sat, lum], 100) % Math.floor(Color.maxSLTuple / 2);

    const finder = new Finder(this.dbPath);
    finder.setUp();
    let method = null;
    if (findClosest) { method = 'getClosestWordByScore'; }
    else {
      method = getAllResults ? 'getAllWordsByScore' : 'getOneWordByScore';
    }
    switch (this.encoding.descriptorKind) {
      case 'color':
        return finder[method](num);
      case 'gray':
        return finder[method](lum);
    }
  }

}
export default Encoder;

/**
 * Utility function to recursively flatten multi-dimensional arrays.
 *
 * @param {Array} array
 * @returns {Array} The flattened array
 */
function flatten(array) {
  return array.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
    );
  }, []);
}
