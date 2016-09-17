/**
 * @module commands
 */

import Decoder       from "+/colors/Decoder";
import print, * as p from "+/commands/utils/printing";


/**
 * Decode the given input tuple into its corresponding color.
 *
 * @param {String} input - The color tuple to decode
 * @param {Object} opts - Command-line options.
 *                        'format' determines the color mode to output.
 * @see Decoder
 */
function decode(input, opts) {
  const format = opts.format || 'hex';

  const decoder = new Decoder(input.join(' '));
  decoder.decode()
    .then((color) => {
      print(`Successfully decoded tuple \`${p.em(input.join(' '))}\`.`, p.SUCCESS);
      print('', p.NORMAL);
      print(color.format(format), p.RETURN);
    })
    .catch((err) => {
      print(err.message ? err.message : err, p.ERROR);
      process.exit(1);
    });
}
export default decode;
