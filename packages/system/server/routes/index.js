'use strict';

module.exports = function(System, app, auth, database) {

  // Home route
  var index = require('../controllers/index');
  app.route('/').get(index.render);
  app.route('/potential/all').get(index.getAllPotentialUsers);
  app.route('/potential/unprocessed').get(index.getUnProcessedPotentialUsers);
  app.route('/potential/new').post(index.newPotential);
  app.route('/potential/process').post(index.processPotential);
  app.route('/potential/process/undo').post(index.unProcessPotential);
};
