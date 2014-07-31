'use strict';

// Service used for interacting with Potential Users
angular.module('mean.system').factory('PotentialUsers', function($http) {
    return {
        getAllPotentialUsers: function() {
            return $http.get('/potential/all');
        }
    };
});