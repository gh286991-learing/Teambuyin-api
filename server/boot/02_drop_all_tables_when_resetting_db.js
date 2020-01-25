module.exports = (app, cb, forForceReset = false) => {
  const {
    dataSources: {
      db: dataSource,
    },
  } = app;

  let isResettingDB = false;
  process.argv.forEach((val) => {
    if (val === 'reset-db') isResettingDB = true;
  });
  if (forForceReset) isResettingDB = true;
  if (!isResettingDB) {
    cb();
    return;
  }

  dataSource.connector.execute('SHOW TABLES;', [], (err, results) => {
    if (err) throw err;

    const existingTableNames = results.map(tableData => tableData[Object.keys(tableData)[0]]);

    // 'SHOW TABLES;' is just a placeholder query to prevent error.
    const dropTablesSql = existingTableNames.length === 0 ? 'SHOW TABLES;' : `
    DROP TABLE IF EXISTS ${existingTableNames.map(name => `\`${name}\``)
    .join(', ')};
  `;

    // drop all existing tables
    dataSource.connector.execute(dropTablesSql, [], (err2) => {
      if (err2) throw err2;
      cb();
    });
  });
};
