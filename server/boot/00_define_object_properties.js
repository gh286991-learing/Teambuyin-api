'use strict';

module.exports = function (server, next) {
  // NOTE: Ref: https://stackoverflow.com/questions/50993498/flat-is-not-a-function-whats-wrong
  // eslint-disable-next-line
  Object.defineProperty(Array.prototype, 'flat', {
    value(depth = 1) {
      return this.reduce((flat, toFlatten) => flat.concat((Array.isArray(toFlatten) && (depth > 1))
        ? toFlatten.flat(depth - 1)
        : toFlatten), []);
    },
  });

  next();
};
