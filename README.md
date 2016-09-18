<p align="center">
  <img src="http://colorcue.loganbraga.fr/logo.png" alt="colorcue"/>
</p>

# colorcue

Encode colors into easy-to-remember two-word tuples.

### Contents

1. [Concept](#concept)
2. [Installation](#installation)
3. [Usage](#usage)
4. [How it works](#how-it-works)
5. [Contributing](#contributing)
6. [License](#license)


### Concept

Colorcue is a command-line utility that can encode colors in multiple formats
into an easy-to-remember tuple of two words.
The resulting tuple is composed of a "normal" word drawn from a given words
database, and a descriptor word that is selected from a handmade list. The
descriptor word is selected from the general hue of the color and is thus
reminiscent of it.

The encoding algorithm uses a separate words database, but the decoding is done
independently of the list used during encoding and can be done by hand in a
low-tech environment, with only a calculator (encoding is a bit trickier by
hand, though).

Example: **#C6242C**, a red/rose color, can be encoded into the tuple
**rosewood bundles**.

Tuples are case-insensitive, but the order of their words is significant.


**Note**: colorcue does _not_ guarantee a lossless encoding/decoding roundtrip.
This program's main purpose is to generate mnemonics for colors, but in order to
do so with short and reasonable results, colors channels are rounded to the
nearest integer. This may result in slight differences between roundtrips,
although those differences should not be visually significant.

### Installation

You will need a recent version of NodeJS.

##### NPM

`npm install -g colorcue`

##### Build by hand

```
git clone https://github.com/loganbraga/colorcue
cd colorcue
npm install
npm run build
```

#### Needed data

You'll also need a wordlist to generate the database. If you don't have one,
I suggest using [this one](http://colorcue.loganbraga.fr/wordlist.zip), which
was compiled from the SCOWL wordlist project (using words up to size 35, which
should ensure usual and simple words).
Unzip the archive, which contains the wordlist in text format and the SCOWL
copyright notice.

If you choose to use your own wordlist, it should have one word per line,
without spaces. You will need a fairly big list if you want to encode any color
or to be offered alternative choices if the initial encoding does not suit you.
For instance, the aforementioned wordlist contains around 40,000 words.

If you want to check the capability of your wordlist, see documentation for the
`colorcue check` command.

### Usage

See `colorcue --help` and `colorcue <command> --help` for detailed help.

If your version of NodeJS is too old, colorcue may not work properly. You can
force the use of a compatibility mode, which comes at the cost of a slower
startup time, with the `--polyfill` option.

If your terminal does not correctly display ANSI color code escape sequences,
you can disable them with the `-c` or `--no-colors` option.

If you would like to pipe colorcue output into another program or service, you
can disable unnecessary noise with the `-q` or `--quiet` option.

##### Initialization

Before encoding anything, you must generate the database once. This can be done
with `colorcue gendb <path_to_word_list>.`. This generates the database in
`<data folder>/colorcue/db.data`. If you want to generate the database
elsewhere, specify the `-o` or `--output` option.

Data is cleaned before insertion in the database. You can disable rejection
rules with the `-d` or `--disable-rules` option, separated by commas. The
cleaning rules are:

+ empty: remove empty and blank lines **(cannot be disabled)**.
+ reserved: remove words that are already used as special descriptor words
**(cannot be disabled)**.
+ tooShort: remove words smaller than 2 characters.
+ abbreviation: remove words that are all-uppercase.
+ specialChars: remove words that contain non-letter characters.


##### Encoding

Encoding is done with the `encode` command applied to a color.

```
colorcue encode '#c6242c'
=> rosewood bundles
```

You can specify the `-a` or `--all` option to retrieve all tuples from the 
database that can encode the color:

```
colorcue encode '#c6242c' -a
=> rosewood bundles
=> rosewood idiots
=> rosewood stern
=> rosewood entangle
=> ...
```

The color to encode can be supplied in various formats. Most of the time,
*colorcue* can guess the format in use, but you can also specify it with the
`--format` option:

```
colorcue encode 'rgb(12, 88, 145)'
colorcue encode 'hsl(188, 83, 45)'
colorcue encode forestgreen
colorcue encode 12,88,145 --format rgb
```

##### Decoding

Decoding is done with the `decode` command applied on a words tuple.
Note that the case of the words does not matter, but the order of the words is
signficant (except for shades of gray colors).

```
colorcue decode MySpace employee
=> #113DEE
```

You can also specify an output color format:

```
colorcue decode MySpace employee --format keyword
=> blue
colorcue decode rosewood bundles --format hsl
=> hsl(357, 69, 46)
```


##### Replacing

You can replace all colorcue references in a given file with the `replace`
command:

```
colorcue replace style.cc.css --output style.css
```

Colorcue references are in the form `cc:word.word`, for example
`cc:rosewood.bundles`.

You can specify the color output format with the `--format` option, and ignore
invalid references with the `-i` or `--ignore-invalid` flag.

This command is mostly useful to replace your color mnemonics in your CSS files
during your assets compilation pipeline, for example, allowing you to work with
the mnemonics without the hassle of decoding every single color you need to use.


### How it works

Colorcue is partly based on a decoding table and a standalone algorithm.

For encoding:

+ The color is converted to HSL representation, rounding channels to nearest
integer.
+ The hue channel (0-360) is used to select the _descriptor word_ from the predefined
table (see `data/colors.data`).
+ The saturation and luminosity channels (0-100) are merged into a single
integer with the following formula:
```
score = (101 * saturation + luminosity) % 5100
```
+ The words database is searched to find words whose score equals the
previously calculated score. Word scores are obtained by summing the alphabet
position of each letter (starting at 0) multiplied by the indice of the letter
in the word (starting at 97).
+ The descriptor word and the normal word are joined. If the previous score was > 5101
before the modulo operator, the result is [descriptor, word], otherwise it is
[word, descriptor].


For decoding:

+ Structure is determined by looking at the descriptor words table, to find if 
the tuple is in the form [descriptor, word] or [word, descriptor].
+ The hue channel of the color is determined by retrieving the value of the
descriptor word from the descriptor words table (see `data/colors.data`).
+ The score of the normal word is calculated. If the structure was [descriptor, word],
add 5100 to the score.
+ The previous score is split into two integers with the formula:
```
a = floor(score / 101)
b = floor(score - 101 * a)
```
+ The first integer is used as the saturation channel, the second as the
luminosity channel.
+ Color in HSL format is converted back to the requested format.


### Contributing

You can generate the developer documentation with `npm run doc`, and run tests
with `npm test`.

##### TODO

+ Improve algorithm regarding shades of gray so that colors with very low
saturation that are not pure grays are still encoded with gray descriptor words.

### License

MIT. See file `LICENSE` for full license.
