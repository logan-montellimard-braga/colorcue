/**
 * @module commands
 */

import Decoder       from "+/colors/Decoder";
import Color         from "+/colors/Color";
import print, * as p from "+/commands/utils/printing";

import fs       from "fs";

/**
 * Replace colorcue color references (in the form cc:word1.word2) in the given
 * file with their decoding in the given format (defaults to hex).
 *
 * @param {String} file
 * @param {Object} opts
 */
function replace(file, opts) {
  const format = opts.format || 'hex';

  if (!Color.modes.includes(format)) {
    print(`Format \`${p.em(format)}\` is not recognized.`, p.ERROR);
    process.exit(1);
  }

  fs.stat(file, (err, stats) => {
    if (err || stats.isDirectory()) {
      print(`Failed to open file \`${p.em(file)}\`.`, p.ERROR);
      print(p.systemError(err ? err.code : 'EISDIR'), p.ERROR);
      process.exit(1);
    }

    const colorcueRegex = /cc:([A-Za-z\u00C0-\u017F\-]+[\._,][A-Za-z\u00C0-\u017F\-]+)/g;
    const decoder = new Decoder();

    const str = fs.readFileSync(file, 'utf-8');
    replaceAsync(str, colorcueRegex, (match) => {
      decoder.setInput(match.slice(3));
      return decoder.decode()
        .then((color) => {
          return color.format(format);
        })
        .catch((err) => {
          if (opts.ignoreInvalid) {
            print(`Ignoring reference \`${p.em(match)}\`: ${err.message ? err.message : err}`, p.INFO);
            return match;
          } else {
            print(`Reference \`${p.em(match)}\`: ${err.message ? err.message : err}`, p.ERROR);
            process.exit(1);
          }
        });
    })
    .then((replacedFile) => {
      if (!opts.output) {
        print(replacedFile, p.RETURN);
      } else {
        fs.writeFileSync(opts.output, replacedFile);
        print(`Successfully written to \`${p.em(opts.output)}\``, p.SUCCESS);
      }
    })
    .catch((err) => {
      print(err.message ? err.message : err, p.ERROR);
      process.exit(1);
    });

  });
}
export default replace;


/**
 * String replacement function that takes an async callback returning a promise
 * of the replacement.
 *
 * @private
 * @param {String} str
 * @param {RegExp} re
 * @param {Function} callback
 * @returns {Promise} A promise that resolves to the replaced string.
 */
function replaceAsync(str, re, callback) {
  let parts = [];
  let i = 0;
  if (Object.prototype.toString.call(re) === '[object RegExp]') {
    if (re.global) {
      re.lastIndex = i;
    }
    let m;
    while (m = re.exec(str)) {
      const args = m.concat([m.index, m.input]);
      parts.push(str.slice(i, m.index), callback.apply(null, args));
      i = re.lastIndex;
      if (!re.global) { break; }
      if (m[0].length === 0) { re.lastIndex++; }
    }
  } else {
    re = String(re);
    i = str.indexOf(re);
    parts.push(str.slice(0, i), callback.apply(null, [re, i, str]));
    i += re.length;
  }
  parts.push(str.slice(i));

  return Promise.all(parts).then((strings) => {
    return strings.join('');
  });
}
