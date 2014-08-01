'use strict';

// Service used for interacting with Potential Users
angular.module('mean.system').factory('PotentialUsers', function($http) {
    return {
        getAllPotentialUsers: function() {
            return $http.get('/potential/all');
        },
        getUnProcessedPotentialUsers: function() {
            return $http.get('/potential/unprocessed');
        },
        process: function( pUser ) {
        	return $http.post('/potential/process', pUser);
        },
        undoProcess: function( pUser ) {
        	return $http.post('/potential/process/undo', pUser);
        }
    };
});