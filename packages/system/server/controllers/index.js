'use strict';

var mean = require('meanio');
var mongoose = require('mongoose'),
  PotentialUser = mongoose.model('PotentialUser');

/**
*   Lock a PotentialUser. Emits an event to all sockets (other than current socket!)
*/
exports.lockPotentialUser = function (id, socket, cb) {
    PotentialUser.findOneAndUpdate({ _id: id}, {locked: true}, function ( err ) {
        if (err) { console.log(err); return; }
        socket.broadcast.emit('potential:locked', id);  // broadcast emits to all sockets but this one.
        console.log('PotentialUser ' + id + ' locked.');
        if (cb) cb();
    });
};

/**
*   Release a PotentialUser from control. Emits an event to all sockets.
*/
exports.releasePotentialUser = function (id, app, cb) {
    PotentialUser.findOneAndUpdate({ _id: id}, {locked: false}, function ( err ) {
        if (err) { console.log(err); return; }
        // Remove the locked user from list of this socket's locked users...
        app.sockets.emit('potential:released', id);
        console.log('PotentialUser ' + id + ' released.');
        if (cb) cb();
    });
};

/**
*   Loop through all users that are currently locked by current socket.
*/
exports.releasePotentialUsersFromLoggedInUser = function ( lockedUsers, app ) {
    for (var i = 0; i < lockedUsers.length; i++) {
        exports.releasePotentialUser( lockedUsers[i], app);
    }
};


/**
*   Toggle the success of a Potential User.
*/
exports.togglePotentialSuccess = function ( req, res ) {
    console.log('toggleSuccess: ' + req.body._id + ' ' + req.body.success);
    PotentialUser.findOneAndUpdate({ _id: req.body._id}, {$set: { success: req.body.success}}, function ( err ) {
        if (err) { console.log(err); res.status(400).send(); return; }
        res.status(200).send();
    });
};

/**
*   Get unprocessed Potential Users.
*/
exports.getUnProcessedPotentialUsers = function ( req, res ) {
    PotentialUser.find( { 'processing.isProcessed': false }, function ( err, users ) {
        if (err) { console.log(err); res.status(400).send(); return; }
        res.send(users);
    });
};

exports.getProcessedPotentialUsers = function ( req, res ) {
    PotentialUser.find( { 'processing.isProcessed' : true } )
                 .populate( { path: 'processing.processedBy', select: 'name'} )
                 .exec( function ( err, users ) {
        if (err) { console.log(err); res.status(400).send(); return; }
        res.send( users );
    });
};

/**
*   Get all of the PotentialUser's stored in the db.
*/
exports.getAllPotentialUsers = function ( req, res ) {
    PotentialUser.find({}, function ( err, users ) {
        if (err) {
            res.status(400).send();
            console.log(err);
        } else {
            res.send(users);
        }
    });
};

/**
*   Process a PotentialUser. 
*/
exports.processPotential = function (req, res) {
    PotentialUser.findOne({_id: req.body._id}, function ( err, userdoc ) {
        if (err) { console.log(err); res.status(400).send(); return; }
        userdoc.processing.isProcessed = true;
        userdoc.processing.dateProcessed = new Date();
        userdoc.processing.messageSentToUser = req.body.processing.messageSentToUser;
        userdoc.processing.siteReferedTo = req.body.processing.siteReferedTo;
        userdoc.processing.processedBy = req.user._id;
        userdoc.processing.readability = req.body.processing.readability;
        userdoc.save( function (err) {
            if (err) {console.log(err); res.status(400).send(); return;}
            // Saved the user, emit the event
            mean.app.sockets.emit('potential:processed', userdoc._id);
            res.status(200).send();
        });
    });
};

/**
*   Un-Process a PotentialUser.
*/
exports.unProcessPotential = function ( req, res ) {
    PotentialUser.findOne({_id: req.body._id}, function ( err, userdoc ) {
        if (err) { console.log(err); res.status(400).send(); return; }
        userdoc.processing.isProcessed = false;
        userdoc.processing.dateProcessed = undefined;
        userdoc.processing.messageSentToUser = undefined;
        userdoc.processing.siteReferedTo = undefined;
        userdoc.processing.processedBy = undefined;
        userdoc.save( function (err) {
            if (err) {console.log(err); res.status(400).send(); return;}
            mean.app.sockets.emit('potential:new', userdoc);  // send the potential:new signal so the user is put back into views...
            res.status(200).send();
        });
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
exports.newPotential = function ( req, res ) {
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

    // 3. If the contextUrl and/or userUrl does not have http(s) add it.  (not super solid but catches urls without http(s))
    if (tmpPotentialUser.contextUrl.indexOf('http') < 0)
        tmpPotentialUser.contextUrl = 'http://' + tmpPotentialUser.contextUrl;
    if (tmpPotentialUser.userUrl && tmpPotentialUser.userUrl.indexOf('http') < 0)
        tmpPotentialUser.userUrl = 'http://' + tmpPotentialUser.userUrl;

    // 4. Attatch the current user as the finder
    tmpPotentialUser.finder = req.user._id;

    var potentialUser = new PotentialUser(tmpPotentialUser);
    potentialUser.save(function(err) {
        if (err) {
            res.status(404).send({code: 3, message: 'Could not save the new PotentialUser. May already exist.'});
            console.log(err);
        } else {
            mean.app.sockets.emit('potential:new', potentialUser);
            res.status(200).send();
        }
    });
};


exports.render = function ( req, res ) {

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
