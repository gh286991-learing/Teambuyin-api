/**
 * This boot script automatically updates the mysql schema to match current model definitions.
 *
 * Please note that if you deleted any properties from a model, the column will be dropped,
 * and there might be data lost.
 *
 * Learn more:
 * https://loopback.io/doc/en/lb3/Creating-a-database-schema-from-models.html
 */

// 'use strict';

// const modelConfig = require('../model-config.json');

// module.exports = (server, cb) => {
//   const {
//     db,
//   } = server.dataSources;
//   const modelsToUpdate = [];

//   // get all model names that's connected to mysql
//   Object.keys(modelConfig).forEach((modelName) => {
//     if (modelConfig[modelName].dataSource === 'db') {
//       modelsToUpdate.push(modelName);
//     }
//   });

//   // to check if database changes are required
//   db.isActual(modelsToUpdate, (checkErr, actual) => {
//     if (checkErr) throw checkErr;
//     if (!actual) {
//       // if there are existing table in database, running auto-migrate will drop
//       // and re-create the tables. To avoid data lost, we use auto-update instead.
//       // For more details please refers to official web.
//       // https://loopback.io/doc/en/lb3/Creating-a-database-schema-from-models.html#auto-update
//       db.autoupdate(modelsToUpdate, (err) => {
//         if (err) throw err;
//         console.log('[boot/auto-update-mysql-schema] Updated schemas for tables:');
//         modelsToUpdate.forEach((modelName) => {
//           console.log(`success created schema for model ${modelName}`);
//         });
//       });
//     }
//   });

//   process.nextTick(cb);
// };

'use strict';

const modelConfig = require('../model-config.json');

module.exports = (app, cb) => {
  /*
   * The `app` object provides access to a variety of LoopBack resources such as
   * models (e.g. `app.models.YourModelName`) or data sources (e.g.
   * `app.datasources.YourDataSource`). See
   * https://loopback.io/doc/en/lb3/Working-with-LoopBack-objects.html
   * for more info.
   */
  const {
    db,
  } = app.dataSources;
  const modelsToUpdate = [];
  // get all model names that's connected to mysql
  Object.keys(modelConfig).forEach((modelName) => {
    if (modelConfig[modelName].dataSource === 'db') {
      modelsToUpdate.push(modelName);
    }
  });

  // to check if database changes are required
  db.isActual(modelsToUpdate, (checkErr, actual) => {
    if (checkErr) throw checkErr;
    if (!actual) {
      // if there are existing table in database, running auto-migrate will drop
      // and re-create the tables. To avoid data lost, we use auto-update instead.
      // For more details please refers to official web.
      // https://loopback.io/doc/en/lb3/Creating-a-database-schema-from-models.html#auto-update
      db.autoupdate(modelsToUpdate, (err) => {
        if (err) throw err;
        console.log('[boot/auto-update-mysql-schema] Updated schemas for tables:');
        modelsToUpdate.forEach((modelName) => {
          console.log(`success created schema for model ${modelName}`);
        });
        cb();
      });
    } else {
      console.log('No changes, schema update was skipped');
      cb();
    }
  });
};
