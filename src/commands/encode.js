/**
 * @module commands
 */

import Encoder       from "+/colors/Encoder";
import Decoder       from "+/colors/Decoder";
import Color         from "+/colors/Color";
import DB_PATH       from "+/commands/utils/dataPath";
import print, * as p from "+/commands/utils/printing";

import fs from "fs";

/**
 * Default format in which the color input is expected.
 *
 * @constant
 * @default
 * @type {String}
 */
const DEFAULT_FORMAT = 'hex';

/**
  * Encode the given color in the given format into a words tuple.
  * If not specified, an attempt is made to unambiguously determine the color
  * input format.
  * After encoding, decoding is done on the resulting tuple to see whether a small
  * loss of precision occured.
  *
  * If the database does not contain enough words to encode the given color 
  * within acceptable precision loss, an error is raised. If the --force option
  * was supplied, another attempt at encoding is made, allowing for potentially
  * heavy precision loss.
  *
  * @param {String} color - The color to encode
  * @param {Object} opts - Command-line options.
  * @see Encoder
*/
function encode(color, opts) {
  const db = opts.database || DB_PATH;

  const attemptedFormat = attempFormatRecognition(color);
  let format = null;

  if (opts.format) {
    format = opts.format;
    switch (format) {
      case 'rgb':
      case 'hsl':
      case 'hsv':
      case 'hwb':
      case 'cmyk':
      case 'xyz':
      case 'lab':
      case 'lch':
      case 'hcg':
      case 'apple':
        color = color.split(',').map((n) => { return parseInt(n, 10); });
        break;
    }
    if (format === 'keyword') {
      if (!Color.cssColors.includes(color)) {
        print(`Color \`${p.em(color)}\` is not recognized as a valid CSS keyword.`, p.ERROR);
        process.exit(1);
      }
    }
    if (attemptedFormat && attemptedFormat[0] !== format) {
      print(`Format \`${p.em(format)}\` specified but input was detected as \`${p.em(attemptedFormat[0])}\`.`, p.INFO);
    } else if (attemptedFormat) {
      color = attemptedFormat[1];
    }
  } else {
    if (attemptedFormat) {
      format = attemptedFormat[0];
      color = attemptedFormat[1];
      if (format !== DEFAULT_FORMAT) {
        print(`Recognized color format \`${p.em(format)}\`.`, p.INFO);
      }
    } else {
      print('Unrecognizable or ambiguous color input.', p.ERROR);
      print(`Please specify format with the ${p.em('--format')} option.`, p.ERROR);
      process.exit(1);
    }
  }

  fs.stat(db, (err, stats) => {
    if (err || stats.isDirectory()) {
      print(`Failed to open database \`${p.em(db)}\`.`, p.ERROR);
      print(p.systemError(err ? err.code : 'EISDIR'), p.ERROR);
      process.exit(1);
    }

    const encoder = new Encoder(db, color, format);
    encoder.encode(opts.allTuples)
      .then((result) => {
        const resultColor = result[0];
        const decoder = new Decoder(resultColor);
        decoder.decode()
          .then((decodedColor) => {
            const originalColorStr = Color.pureFormat(color, format);
            const decodedColorStr  = decodedColor.format(format);

            if (originalColorStr.toUpperCase() !== decodedColorStr.toUpperCase()) {
              print(`Color ${p.em(originalColorStr)} cannot be losslessly encoded...`, p.INFO);
              print(`...rounding to nearest color, ${p.em(decodedColorStr)}.`, p.INFO);
            }

            let message = `Successfully encoded color ${p.em(decodedColorStr)}`;
            if (opts.allTuples) {
              message += `, ${p.em(result.length)} choices available`;
            }
            message += '.';
            print(message, p.SUCCESS);
            print('', p.NORMAL);
            result.map((r) => { print(r, p.RETURN); });
          });
      })
      .catch((err) => {
        if (err.code && err.code === 'NOWORDS') {
          const level = opts.force ? p.INFO : p.ERROR;
          print('The database does not contain words that can safely encode this color.', level);
          if (opts.force) {
            print('Searching for a color that can be encoded with this database...', p.INFO);
            encoder.encode(false, true)
              .then((result) => {
                const color = result[0];
                const decoder = new Decoder(color);
                decoder.decode()
                  .then((decodedColor) => {
                    const decodedColorStr = decodedColor.format(format);
                    print(`...alternative color ${p.em(decodedColorStr)} found.`, p.INFO);
                    print(`Successfully encoded alternative color ${p.em(decodedColorStr)}.`, p.SUCCESS);
                    print('', p.NORMAL);
                    print(color, p.RETURN);
                  });
              })
              .catch((err) => {
                if (err.code && err.code === 'NOWORDS') {
                  print("No alternative color found. The database cannnot encode this color at all.", p.ERROR);
                } else {
                  print(err.message ? err.message : err, p.ERROR);
                }
                process.exit(1);
              });
          } else {
            print(`Use option ${p.em('-f')} or ${p.em('--force')} to allow potentially high precision loss.`, p.ERROR);
            process.exit(1);
          }
        } else {
          print(err.message ? err.message : err, p.ERROR);
          process.exit(1);
        }
      });
  });
}
export default encode;

/**
 * Parse the given string in an attemp to determine the format in which the
 * color is.
 *
 * @param {String} color - The color input
 * @returns {Array|Boolean} An array in the form [mode, parsed color] if parsing
 *                         was a success, false otherwise.
 */
function attempFormatRecognition(color) {
  color = color.toLowerCase();

  if (Color.cssColors.includes(color)) { return ['keyword', color]; }

  if (/^#?[\dabcdef]{6}$/i.test(color)) { return ['hex', color]; }

  if (/^[a-z]{3,5}\(\d+(\.\d+)?(,\s*\d+(\.\d+)?){2,3}\);?$/.test(color)) {
    const mode = color.split('(')[0];
    if (Color.modes.includes(mode)) {
      const rx = /[a-z]{3,5}\(((,?\s*\d+(\.\d+)?)+)\);?/;
      let channels = rx.exec(color)[1];
      channels = channels.split(/,\s*/g).map(m => { return parseFloat(m, 10); });
      return [mode, channels];
    }
  }

  return false;
}
