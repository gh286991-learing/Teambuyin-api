module.exports = (app, cb) => {
  app.emit('ready');
  cb();
};
