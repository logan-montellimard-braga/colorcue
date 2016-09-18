/**
 * Command-line specification and commands definition.
 *
 * @module colorcue
 */

import program from "commander";

import gendb    from "+/commands/gendb";
import check    from "+/commands/check";
import encode   from "+/commands/encode";
import decode   from "+/commands/decode";
import replace  from "+/commands/replace";
import Color    from "+/colors/Color";

import print, * as p from "+/commands/utils/printing";


export default program;

/**
 * List of subcommands for the program.
 *
 * @type {Array}
 * @constant
 */
export const subcommands = [
  'gendb',
  'encode',
  'decode',
  'check',
  'replace'
];

program
  .version('0.0.1')
  .option('-q, --quiet', 'show only error messages and return values')
  .option('-c, --no-colors', "don't print with colors")
  .option('--polyfill', "load es6 polyfill (slower)");

program
  .command('gendb <file>')
  .description('Generate words database from given data file.')
  .option('-o, --output-file <file>', `set database location (default local)`)
  .option('-f, --force', 'override output file if it already exists')
  .option('-d, --disable-rules <rules>', `comma-separated list of rejection rules\n${new Array(30).join(' ')}to disable when cleaning data`)
  .action((dataFile, opts) => { gendb(dataFile, opts); })
  .on('--help', () => {
    print(
`  -----------------------------------------------------------------------------

  This command is used to create and fill a database with words and their
  calculated score to use for encoding.
  This command must be run with a big enough wordlist once, before you can encode
  colors.

  See command \`${p.em('check')}\` to find whether a wordlist is big enough to
  cover all possible colors encoding schemes.
    `);
  });

program
  .command('encode <color>')
  .description('Encode the given color into a words tuple.')
  .option('--format <format>', 'format the color is given in (default: hex)')
  .option('-d, --database <database>', 'the words database to use (default local)')
  .option('-a,--all-tuples', 'return all tuples that can encode the color')
  .option('-f, --force', 'force heavy precision loss if database is too small')
  .action((color, opts) => { setTimeout(() => { encode(color, opts); }, 0); })
  .on('--help', () => {
    print(
`  Color formats:
    ${Color.modes.join(', ')}.

  For color formats expressed as a combination of multiple channels (eg: rgb is
  composed of 3 channels), the color must be supplied as a comma-separated list
  of said channels. For instance, color \`rgb(22, 17, 131)\` should be supplied
  in the form \`22,17,131\`.
  Color formats expressed as a single number or word can be directly supplied to
  the command.

  -----------------------------------------------------------------------------

  This command is used to encode a given color in a specified color format
  (defaults to hexadecimal string) into a two-word tuple. Generated tuples are
  easy to remember, with one of the two words being picked by the general hue of
  the color to encode so that the resulting tuple roughly evokes the original
  color.

  Note that the encoding may be computationally lossy, but the precision loss
  between encoding/decoding roundtrips should not be significant enough to be
  perceived by the naked eye.

  See command \`${p.em('decode')}\` to decode back a words tuple given by this
  command into the original color (or a visually equivalent one).
    `);
  });

program
  .command('decode <words...>')
  .description('Decode the given words tuple into its color.')
  .option('--format <format>', 'ouput the color in the given format (default: hex)')
  .action((words, opts) => { decode(words, opts); })
  .on('--help', () => {
    print(
`  Color formats:
    ${Color.modes.join(', ')}.

  -----------------------------------------------------------------------------

  This command is used to decode a previously encoded color back.
  The color you get back may not be exactly the same as the one you encoded; it
  is because encoding is a lossy operation. Color channels are rounded during
  conversions and encoding to allow for an easy-to-remember format. Differences
  between roundtrips of encoding/decoding should not be significant enough to be
  perceived by the naked eye.

  Note that if you specify a non-conventional output format, the difference
  between the original color and the decoded one may be significant. For
  instance, asking for a color to be decoded into the css \`keyword\` format
  would result in the original color being rounded to the nearest css keyword
  color available, resulting in severe precision loss as only a handful of
  colors can be defined in this format.

  See command \`${p.em('encode')}\` to encode a color into a words tuple you
  can decode with this command.
    `);
  });

program
  .command('replace <file>')
  .description('Replace colorcue references in given file.')
  .option('-o, --output <file>', 'file ouput (default: STDOUT)')
  .option('--format <format>', 'replace the colors in the given format (default: hex)')
  .option('-i, --ignore-invalid', 'ignore invalid references')
  .action((file, opts) => { replace(file, opts); })
  .on('--help', () => {
    print(
`  Color formats:
    ${Color.modes.join(', ')}.

  -----------------------------------------------------------------------------

  This command is used to replace all colorcue references in the given file with
  the decoded color in the supplied format.
  Colorcue references are in the form \`cc:word<separator>word\`, where
  <separator> is any of \`.\`, \`,\` or \`_\`.
  For example, the following strings are all valid colorcue references:
    - cc:rosewood.bundles
    - cc:MySpace,employee
    - cc:awful_polka-dot

  If the --ignore-invalid flag is given, any invalid colorcue reference will be
  left unchanged in the output and decoding will continue for the rest of the
  file. Otherwise, the first invalid reference encountered shuts down processing
  and no output is generated.

  This command is mostly useful for replacing your color mnemonics in CSS files.
    `);
  });

program
  .command('check [database]')
  .description(`Check that the database has enough words (default local).`)
  .action((database) => { check(database); })
  .on('--help', () => {
    print(
`  -----------------------------------------------------------------------------

  This command is used to check whether a given generated database file
  contains enough words to allow the encoding of any color.
  Checking is done by verifying that every score in the possible range of scores
  is mapped to at least one word. If that's the case, every number that needs to
  be converted to a word during encoding can be.

  Note that encoding can, in some cases, still be performed with a database that
  does not pass this check; it just means that your wordlist cannot map a word
  to every potential number that may be encoded. If the encoding of your color
  only uses numbers that can be obtained from words in your wordlist, then it
  will still succeed.

  Note that this test is only meaningful to determine if your wordlist is
  sufficient for encoding. Decoding is done by an algorithm that does not need
  any external data source.

  See command \`${p.em('gendb')}\` to generate a testable database from a data
  file.
    `);
  });
