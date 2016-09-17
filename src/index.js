#! /usr/bin/env node
/**
 * @module colorcue
 */

import "+/constants";
import commands, * as c from "+/commands";
import print   , * as p from "+/commands/utils/printing";

import domain from "domain";

/**
 * Catch-all domain. This domain is used to catch any uncaught error and formats
 * it for printing.
 * This should only call unforeseen (bug) or exceptional errors since basic
 * error handling is done with each command.
 *
 * @constant
 * @type {Domain}
 */
const dom = domain.create();
dom.on('error', (err) => {
  print('Uncaught error', p.ERROR);
  print(err, p.ERROR);
  process.exit(1);
});

dom.run(() => {
  // Manually parse polyfill option because if the option is needed, the
  // commander.js parsing may not succeed.
  for (const arg of process.argv.slice(2)) {
    if (arg === '--polyfill') { require('babel-polyfill'); }
  }

  commands.parse(process.argv);
  if (!commands.colors) { p.noColors(); }
  if (commands.quiet) { p.quiet(); }

  // Print help if no input or if first argument is not a valid subcommand
  if (process.argv.slice(2).length === 0 ||
      !c.subcommands.includes(process.argv[2])) {
    commands.outputHelp();
    process.exit(1);
  }

});
