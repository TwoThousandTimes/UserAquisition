'use strict';

angular.module('mean.system').controller('PotentialsInputController', ['$scope', '$rootScope', 'Global', '$http', 'PotentialUsers',
    function($scope, $rootScope, Global, $http, PotentialUsers) {
        $scope.global = Global;
        $scope.potential = {};  // Initialize potential as empty obj

        PotentialUsers.getAllPotentialUsers().success(function(users) {
            $scope.potentialUsers = users;
            
        }).error(function() {
            // TODO: handle event that no users are returned
        });

        $scope.submitPotential = function() {
            $http.post('/potential/new', {
                contextUrl: $scope.potential.contextUrl,
                userUrl: $scope.potential.userUrl,
                username: $scope.potential.username,
                karma: $scope.potential.karma,
                freq: $scope.potential.freq,
                comments: $scope.potential.comments
            }).success(function(response) {
                // 1. Clear the form
                $scope.potential = {};
                // 2. Add the new potential user to the list
                console.log(response);
            }).error(function(error) {
                // TODO: process error and handle accordingly
                alert('error: ' + error);
            });
        };
    }
]);