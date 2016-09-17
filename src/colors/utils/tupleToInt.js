/**
 * Module containing functions to switch back and forth between tuples of
 * integers and single integers.
 *
 * @module colors/utils
 */

/**
 * @type {Object}
 * @constant
 */
const exports = {
  encode: encode,
  decode: decode
};
export default exports;

/**
 * Encode a given tuple of two integers into a single integer that can be decoded
 * back.
 *
 * @param {Array.Number} tuple - The tuple to encode
 * @param {Number} maxValue - The maximum value each number in the tuple can take
 * @returns {Number} The encoded number
 * @throw Exception if any of the numbers in the tuple exceed the given maxValue
 */
export function encode(tuple, maxValue) {
  const [a, b] = tuple;
  if (a > maxValue || b > maxValue) {
    throw "Tuple members can't exceed the given maxValue.";
  }

  return (maxValue + 1) * Number.parseInt(a, 10) + Number.parseInt(b, 10);
}

/**
 * Decode a single integer into a tuple of two numbers.
 *
 * @param {Number} number - The number to decode
 * @param {Number} maxValue - The maximum value each number in the tuple can take
 * @returns {Array.Number} - The decoded two-integer tuple
 * @throw Exception if the number to decode can't have been encoded with the
 *        same maxValue
 */
export function decode(number, maxValue) {
  if (number > Math.pow((maxValue + 1), 2) || number < 0) {
    throw `Input cannot be decoded into numbers smaller than ${maxValue}.`;
  }

  const a = Math.floor(number / (maxValue + 1));
  const b = number - a * (maxValue + 1);
  return [a, b];
}
