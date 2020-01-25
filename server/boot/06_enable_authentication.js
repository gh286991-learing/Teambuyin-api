const loopback = require('loopback');

module.exports = async (app, cb) => {
  const {
    User,
    Role,
    RoleMapping,
  } = app.models;


  // NOTE: Enable authentication for whole server
  app.enableAuth();
  app.use(loopback.token({
    model: app.models.accessToken,
    currentUserLiteral: 'me',
  }));
  // NOTE: Create default admin and users
  const defaultAccounts = [
    {
      data: {
        name: 'Admin',
        account: 'admin',
        password: 'admin',
        email: 'admin@test.com',
      },
      role: {
        name: 'Admin',
        description: 'the system administrator',
      },
    },
    {
      data: {
        name: 'User',
        account: 'user',
        password: 'user',
        email: 'user@test.com',
      },
      role: {
        name: 'User',
        description: 'the user',
      },
    },
  ];
  await Promise.all(defaultAccounts.map(defaultAccount => new Promise((resolve, reject) => {
    User.findOrCreate({
      where: {
        account: defaultAccount.data.account,
      },
    }, defaultAccount.data, (createAccountErr, userInstance) => {
      if (createAccountErr) reject(createAccountErr);

      Role.findOrCreate({
        where: {
          name: defaultAccount.role.name,
        },
      }, defaultAccount.role, (createRoleErr, roleInstance) => {
        if (createRoleErr) reject(createRoleErr);

        // establish relations between user and role
        const roleMap = {
          principalType: RoleMapping.USER,
          principalId: userInstance.id,
          roleId: roleInstance.id,
        };
        RoleMapping.findOrCreate({
          where: roleMap,
        }, roleMap, (createRoleMapErr) => {
          if (createRoleMapErr) reject(createRoleMapErr);
          console.log(`Default account (${defaultAccount.data.account}) checked!`);
          resolve();
        });
      });
    });
  })));

  cb();
};
