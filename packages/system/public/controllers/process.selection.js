'use strict';

angular.module('mean.system').controller('ProcessSelectionController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers', '$state',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers, $state) {
        $scope.global = Global;
        $scope.potentialUsers = [];

        PotentialUsers.getAllPotentialUsers().success(function(users) {
            $scope.potentialUsers = users;
        }).error(function() {
            // TODO: handle event that no users are returned
        });

        $scope.userChecked = function( pUser ) {
            if (pUser.selected) {
                // Just selected this user, try to lock that user.
                $window.socket.emit('potential:lock', pUser._id);
            } else {
                // De-selected user, try to unlock that user.
                $window.socket.emit('potential:release', pUser._id);
            }
        };

        $scope.processSelectedUsers = function () {
            var selectedUsers = $scope.potentialUsers.filter( function (user) {
                return user.selected;
            });
            $scope.global.selectedUsers = selectedUsers;
            $state.go('process');
        };

        $window.socket.on('potential:new', function (user) {
            $scope.potentialUsers.unshift(user);
            $scope.$apply();  // update the view
            console.log('potential:new  ', user.username);
        });

        $window.socket.on('potential:locked', function (id) {
            // Find the potential user with the given id and lock them!
            for (var i = $scope.potentialUsers.length - 1; i >= 0; i--) {
                if ($scope.potentialUsers[i]._id === id) {
                    $scope.potentialUsers[i].locked = true;
                    $scope.$apply();
                }
            }
        });

        $window.socket.on('potential:released', function (id) {
            // Find the potential user with the given id and release them!
            for (var i = $scope.potentialUsers.length - 1; i >= 0; i--) {
                if ($scope.potentialUsers[i]._id === id) {
                    $scope.potentialUsers[i].locked = false;
                    $scope.$apply();
                }
            }
        });
    }
]);