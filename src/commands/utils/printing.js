/**
 * @module commands/utils
 */

import colors from "colors";

/**
 * Mutable variable to determine whether to print color escape codes.
 *
 * @private
 * @type {Boolean}
 * @default
 */
let noColorsMode = false;

/**
  * Mutable variable to determine whether to print non mandatory messages.
  *
  * @private
  * @type {Boolean}
  * @default
*/
let quietMode = false;

/**
 * Define how the different themes render on the command-line.
 */
colors.setTheme({
  error   : ['white', 'bgRed', 'bold'],
  success : ['white', 'bgGreen', 'bold'],
  info    : ['white', 'bgBlue', 'bold'],
  normal  : ['reset'],
  return  : ['reset'],
  emphasis: ['bold']
});

/**
 * Error level symbol for printing functions.
 *
 * @constant
 * @type {Symbol}
 */
export const ERROR   = Symbol('error');

/**
 * Success level symbol for printing functions.
 *
 * @constant
 * @type {Symbol}
 */
export const SUCCESS = Symbol('success');

/**
 * Info level symbol for printing functions.
 *
 * @constant
 * @type {Symbol}
 */
export const INFO    = Symbol('info');

/**
 * Normal level symbol for printing functions.
 *
 * @constant
 * @type {Symbol}
 */
export const NORMAL  = Symbol('normal');

/**
 * Return-value level symbol for printing functions.
 *
 * @constant
 * @type {Symbol}
 */
export const RETURN  = Symbol('return');

/**
 * General print function. Print a message to the appropriate output channel
 * based on its alert level, and add level informations and colors if allowed.
 * Recognized levels: ERROR, SUCCESS, INFO, NORMAL and RETURN.
 * 
 * NORMAL and RETURN levels are functionally the same, but RETURN is
 * semantically used to represent a command-line return value, and is thus
 * considered a mandatory level; messages with this level are printed even while
 * in quiet mode, which is not the case for NORMAL-level messages.
 *
 * @param {String} message - The message to print
 * @param {Symbol} style - The message level
 */
function print(message = '', style = NORMAL) {
  const stylesToPrefix = {
    'error'   : ' ERR. ',
    'success' : '  OK  ',
    'info'    : ' INFO ',
    'normal'  : '',
    'return'  : ''
  };

  let printingFunction = console.log;
  if (style === ERROR) { printingFunction = console.error; }

  if (style === ERROR) { style = 'error'; }
  else if (style === SUCCESS) { style = 'success'; }
  else if (style === INFO) { style = 'info'; }
  else if (style === RETURN) { style = 'return'; }
  else { style = 'normal'; }

  if (quietMode && style !== 'return' && style !== 'error') { return; }

  const padding = style === 'normal' || style === 'return' ? '' : ' ';

  if (noColorsMode) {
    printingFunction(stylesToPrefix[style] + padding + message);
  } else {
    printingFunction(stylesToPrefix[style][style] + padding + message);
  }
}
export default print;

/**
 * Determine, when possible, an explanatory string for a given system-error
 * code.
 *
 * @param {String} errorCode
 * @returns {String} The full message, or the original error code if no message
 */
export function systemError(errorCode) {
  let ret = errorCode.red + ': ';
  switch (errorCode.toUpperCase()) {
    case 'EACCES':
      ret += 'Permission denied.';
      break;
    case 'EEXIST':
      ret += 'File already exists.';
      break;
    case 'EISDIR':
      ret += 'Expected a file but directory given.';
      break;
    case 'ENOENT':
      ret += 'No such file or directory.';
      break;
    case 'ENOTDIR':
      ret += 'Expected a directory but file given.';
      break;
    case 'EPERM':
      ret += 'Operation not permitted.';
      break;
    default:
      return errorCode;
  }
  return ret;
}

/**
 * Put a string in emphasis, or do nothing if in no-color mode.
 *
 * @param {String} str - The string to put in emphasis
 * @returns {String} - The emphasis'd string
 */
export function em(str) {
  str = str.toString();
  if (noColorsMode) { return str; }
  return str.emphasis;
}

/**
 * Set the no-color mode.
 *
 * @param {Boolean} mode
 * @returns {Boolean} The set mode.
 */
export function noColors(mode = true) {
  noColorsMode = mode;
  return mode;
}

/**
* Set the quiet (non-mandatory messages hiding) mode.
*
* @param {Boolean} mode
* @returns {Boolean} The set mode.
  */
export function quiet(mode = true) {
  quietMode = mode;
  return mode;
}
