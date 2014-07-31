'use strict';

angular.module('mean.system').controller('ProcessSelectionController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers) {
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

        $window.socket.on('potential:new', function (user) {
            $scope.potentialUsers.unshift(user);
            $scope.$apply();  // update the view
            console.log('potential:new  ', user.username);
        });

        $window.socket.on('potential:locked', function (id) {
            // Find the potential user with the given id and lock them!
            var index = $scope.potentialUsers.indexOf(id);
            if (index > -1) {
                $scope.potentialUsers[index].locked = true;
                $scope.$apply();
            }
        });

        $window.socket.on('potential:released', function (id) {
            // Find the potential user with the given id and release them!
            var index = $scope.potentialUsers.indexOf(id);
            if (index > -1) {
                $scope.potentialUsers[index].locked = false;
                $scope.$apply();
            }
        });
    }
]);