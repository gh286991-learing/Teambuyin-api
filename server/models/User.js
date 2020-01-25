/* eslint-disable no-param-reassign , prefer-destructuring */
const R = require('ramda');
const uid = require('uid2');
const whitelistMethods = require('../lib/whitelistMethods');
const error = require('../lib/error');
const regex = require('../lib/regex');
const dropAllTable = require('../../server/boot/02_drop_all_tables_when_resetting_db');
const createAllTable = require('../../server/boot/03_auto-update-db-schema');
const roleResolver = require('../../server/boot/05_role-resolver');
const enableAuthentication = require('../../server/boot/06_enable_authentication');


module.exports = (Model) => {
  whitelistMethods(Model, [
    'find',
    'destroy',
    'findById',
    'prototype.updateAttributes',
    'create',
  ]);


  Model.login = async (ctx, data = {}) => {
    const AccessToken = R.path(['app', 'models', 'AccessToken'], Model);
    const RoleMapping = R.path(['app', 'models', 'RoleMapping'], Model);
    const Role = R.path(['app', 'models', 'Role'], Model);
    const {
      email = '',
    } = data;

    const user = await Model.findOne({
      where: {
        email,
      },
    });

    // NOTE: Create new access token for him

    const accessToken = await AccessToken.create({
      id: uid(64),
      ttl: 3600 * 16, // NOTE: Set the expire time to 16 hours
      userId: user.id,
      created: new Date(),
    });

    // NOTE: Read the roles of this user and attach to the results
    const roleMappings = await RoleMapping.find({
      where: {
        principalType: 'USER',
        principalId: user.id,
      },
    });
    const roles = await Role.find({
      where: {
        id: {
          inq: roleMappings.map(roleMapping => roleMapping.roleId),
        },
      },
    });

    const result = {
      accessToken,
      user,
      roles,
    };
    return result;
  };

  Model.remoteMethod('login', {
    description: 'Login',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'data', type: 'object', http: { source: 'body' } },
    ],
    http: { path: '/login', verb: 'post' },
    returns: { arg: 'data', type: 'object', root: true },
  });

  Model.logout = async (ctx, options) => {
    const AccessToken = R.path(['app', 'models', 'AccessToken'], Model);
    const tokenId = R.pathOr('', ['accessToken', 'id'], options);
    await AccessToken.deleteById(tokenId);
    return 'OK';
  };
  Model.remoteMethod('logout', {
    description: 'Logout',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
    ],
    http: { path: '/logout', verb: 'post' },
    returns: { arg: 'data', type: 'object', root: true },
  });


  Model.resetDB = (ctx, next) => {
    dropAllTable(ctx.req.app, () => {
      createAllTable(ctx.req.app, () => {
        roleResolver(ctx.req.app, () => {
          enableAuthentication(ctx.req.app, () => {
            next();
          });
        });
      });
    }, true);
  };

  Model.remoteMethod('resetDB', {
    description: 'Reset database. DANGEROUS !!!!',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/resetDB', verb: 'post' },
    returns: { arg: 'data', type: 'object', root: true },
  });


  Model.register = async (ctx, data = {}) => {
    const {
      password,
      email,
    } = data;

    if (!password || !email) throw error.badRequest('Email and Password are all required.');

    if (!regex.REGEX_EMAIL.test(email)) throw error.validationError('Invalid Email');

    if (!regex.REGEX_PASSWORD.test(password)) throw error.validationError('Invalid Password');

    if (await Model.findOne({ where: { email } })) throw error.badRequest('Email has already taken.');

    const result = await Model.create({
      password,
      email,
      name: email.split('@')[0],
    });

    const RoleMapping = R.path(['app', 'models', 'RoleMapping'], Model);
    const Role = R.path(['app', 'models', 'Role'], Model);
    const userRole = await Role.findOne({ where: { name: 'user' } });
    await RoleMapping.create({
      principalType: 'USER',
      principalId: result.id,
      roleId: userRole.id,
    });

    return result;
  };
  Model.remoteMethod('register', {
    description: 'Register a new account',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'data', type: 'object', http: { source: 'body' } },
    ],
    http: { path: '/register', verb: 'post' },
    returns: { arg: 'data', type: 'object', root: true },
  });
};
