'use strict';

var mean = require('meanio');
var mongoose = require('mongoose'),
  PotentialUser = mongoose.model('PotentialUser');

/**
*   Get all of the PotentialUser's stored in the db.
*/
exports.getAllPotentialUsers = function(req, res) {
    PotentialUser.find({}, function(err, users) {
        if (err) {
            res.status(400).send();
            console.log(err);
        } else {
            res.send(users);
        }
    });
};

/**
*  Create a new PotentialUser in the database. Returns the new PotentialUser
*  in JSON format.
*       status
*       200: potential user in JSON format
*       400: error in the form {code: , message: }
*           error
*           1: Required fields missing
*           2: Could not extract source (reddit or quora) from the contextUrl
*           3: Error saving potential user (possibly already exists)
*/
exports.newPotential = function(req, res) {
    var tmpPotentialUser = req.body;
    // 0. Check that the proper fields exist.
    if (!tmpPotentialUser.username || !tmpPotentialUser.contextUrl) {
        return res.status(400).send({code: 1, message: 'Required fields not provided.'});
    }

    // 1. Extract the Source of the potential user (ie: reddit.com or quora.com)
    tmpPotentialUser.source = tmpPotentialUser.contextUrl.indexOf('quora') > -1 ? 'quora' : undefined;
    tmpPotentialUser.source = tmpPotentialUser.contextUrl.indexOf('reddit') > -1 ? 'reddit' : tmpPotentialUser.source;

    if (!tmpPotentialUser.source)  // Could not extract source ??
        return res.status(404).send({code: 2, message: 'Could not extract source from contextUrl.'});
    
    // 2. Build the unique index in the form username::source
    tmpPotentialUser.unique = tmpPotentialUser.username + '::' + tmpPotentialUser.source;
    var potentialUser = new PotentialUser(tmpPotentialUser);
    potentialUser.save(function(err) {
        if (err) {
            res.status(404).send({code: 3, message: 'Could not save the new PotentialUser. May already exist.'});
            console.log(err);
        } else {
            mean.app.sockets.emit('potential:new', potentialUser);
            res.status(200).send();
            // res.send(potentialUser);
        }
    });
};


exports.render = function(req, res) {

  var modules = [];
  // Preparing angular modules list with dependencies
  for (var name in mean.modules) {
    modules.push({
      name: name,
      module: 'mean.' + name,
      angularDependencies: mean.modules[name].angularDependencies
    });
  }

  function isAdmin() {
    return req.user && req.user.roles.indexOf('admin') !== -1;
  }

  // Send some basic starting info to the view
  res.render('index', {
    user: req.user ? {
      name: req.user.name,
      _id: req.user._id,
      username: req.user.username,
      roles: req.user.roles
    } : {},
    modules: modules,
    isAdmin: isAdmin,
    adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
  });
};
