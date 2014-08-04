'use strict';

angular.module('mean.system').controller('PotentialsInputController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers) {
        $scope.global = Global;
        $scope.potential = {};  // Initialize potential as empty obj
        $scope.potentialUsers = [];

        PotentialUsers.getUnProcessedPotentialUsers().success(function(users) {
            $scope.potentialUsers = users;
        }).error(function() {
            // TODO: handle event that no users are returned
        });

        $window.socket.on('potential:new', function (user) {
            $scope.potentialUsers.unshift(user);
            $scope.$apply();  // update the view
            console.log('potential:new  ', user.username);
        });

        $window.socket.on('potential:processed', function ( id ) {
            // Find the potential user with the given id and remove them!
            for (var i = $scope.potentialUsers.length - 1; i >= 0; i--) {
                if ($scope.potentialUsers[i]._id === id) {
                    $scope.potentialUsers.splice(i, 1);
                    $scope.$apply();
                    break;
                }
            }
        });

        $scope.submitPotential = function() {
            $http.post('/potential/new', {
                contextUrl: $scope.potential.contextUrl,
                userUrl: $scope.potential.userUrl,
                username: $scope.potential.username,
                karma: $scope.potential.karma,
                freq: $scope.potential.freq,
                comments: $scope.potential.comments
            }).success( function (response) {
                // 1. Clear the form
                $scope.potential = {};
                $scope.errorRequired = false;
                // 2. The user is added to the list of users upon socket response!
            }).error( function (error) {
                // TODO: process error and handle accordingly
                $scope.errorRequired = true;
            });
        };
    }
]);