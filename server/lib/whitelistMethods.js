'use strict';

/**
 * this great idea comes from:
 * https://github.com/strongloop/loopback/issues/651#issuecomment-167111395
 *
 * @param model
 * @param methodsToExpose
 */
const whitelistMethods = (model, methodsToExpose = []) => {
  if (model && model.sharedClass) {
    let methods = Array.prototype.concat(
      model.sharedClass.methods(),
      { name: 'prototype.updateAttributes' },
    );

    try {
      methods = Object
        .keys(model.definition.settings.relations)
        .reduce((all, relation) => all.concat([
          { name: `prototype.__findById__${relation}` },
          { name: `prototype.__destroyById__${relation}` },
          { name: `prototype.__updateById__${relation}` },
          { name: `prototype.__exists__${relation}` },
          { name: `prototype.__link__${relation}` },
          { name: `prototype.__get__${relation}` },
          { name: `prototype.__create__${relation}` },
          { name: `prototype.__update__${relation}` },
          { name: `prototype.__destroy__${relation}` },
          { name: `prototype.__unlink__${relation}` },
          { name: `prototype.__count__${relation}` },
          { name: `prototype.__delete__${relation}` },
        ]), methods);
    } catch (err) {
      throw err;
    }

    methods.forEach((method) => {
      const methodName = method.name;
      if (methodsToExpose.indexOf(methodName) < 0) {
        model.disableRemoteMethodByName(methodName);
      }
    });
  }
};

module.exports = whitelistMethods;
