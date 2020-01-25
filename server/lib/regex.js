'use strict';

/**
 * Regex Rules
 */

/**
 * REGEX_PASSWORD
 * at least one number, one lowercase and one uppercase letter
 * at least seven characters
 */
module.exports = {
  REGEX_PASSWORD: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}/,
  REGEX_FIRSTNAME: /\w+/,
  REGEX_LASTNAME: /\w+/,
  // eslint-disable-next-line
  REGEX_EMAIL: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
};
