'use strict';

// Requires meanio
var mean = require('meanio');

// Creates and serves mean application
mean.serve({ /*options placeholder*/ }, function(app, config) {
	console.log('Mean app started on port ' + config.port + ' (' + process.env.NODE_ENV + ')');

	var PotentialUser = require('./packages/system/server/models/potential.user.js');
	// When starting up the app, clear all locked users (possibly still locked after app crash, etc..)
	PotentialUser.update({locked: true}, {locked: false}, { multi: true }, function(err, numUpdated) {
		if (err) { console.log(err); return; }
		console.log('Unlocked ' + numUpdated + ' PotentialUsers on app start...');
	});

	app.on('connection', function (socket) {
	    console.log('socket:connection');
		var cntrl = require('./packages/system/server/controllers/index.js');
		var lockedPotentialUsers = [];  // Keep track of the sockets locked users

	    socket.on('potential:lock', function (id) {
	    	cntrl.lockPotentialUser(id, socket, function() {
	    		lockedPotentialUsers.push(id);
	    	});
	    });

	    socket.on('potential:release', function (id) {
	    	cntrl.releasePotentialUser(id, app, function() {
	    		var index = lockedPotentialUsers.indexOf(id);
		        if (index > -1) {
		            lockedPotentialUsers.splice(index, 1);
		        }
	    	});
	    });

	    socket.on('disconnect', function() {
	    	cntrl.releasePotentialUsersFromLoggedInUser( lockedPotentialUsers, app );
	    });
	});
	
});
