'use strict';

angular.module('mean.system').controller('ProcessSelectionController', ['$scope', '$rootScope', '$window', 'Global', 'PotentialUsers', '$state', '$filter',
    function($scope, $rootScope, $window, Global, PotentialUsers, $state, $filter) {
        $scope.global = Global;
        $scope.potentialUsers = [];

        PotentialUsers.getUnProcessedPotentialUsers().success(function(users) {
            $scope.potentialUsers = users;
        }).error(function() {
            // TODO: handle event that no users are returned
        });

        $scope.selectUser = function( pUser ) {
            if (pUser.locked) return;

            pUser.selected = !pUser.selected;
            if (pUser.selected) {
                // Just selected this user, try to lock that user.
                $window.socket.emit('potential:lock', pUser._id);
            } else {
                // De-selected user, try to unlock that user.
                $window.socket.emit('potential:release', pUser._id);
            }
        };

        $scope.processSelectedUsers = function () {
            var selectedUsers = $scope.potentialUsers.filter( function ( user ) {
                return user.selected;
            });
            $scope.global.selectedUsers = selectedUsers;
            $state.go('process');
        };

        $window.socket.on('potential:new', function ( user ) {
            $scope.potentialUsers.unshift( user );
            $scope.$apply();  // update the view
        });

        // $window.socket.on('potential:unprocessed', function ( user ) {
        //     $scope.potentialUsers.unshift( user );
        // });

        $window.socket.on('potential:locked', function ( id ) {
            // Find the potential user with the given id and lock them!
            for (var i = $scope.potentialUsers.length - 1; i >= 0; i--) {
                if ($scope.potentialUsers[i]._id === id) {
                    $scope.potentialUsers[i].locked = true;
                    $scope.$apply();
                    break;
                }
            }
        });

        $window.socket.on('potential:released', function ( id ) {
            // Find the potential user with the given id and release them!
            for (var i = $scope.potentialUsers.length - 1; i >= 0; i--) {
                if ($scope.potentialUsers[i]._id === id) {
                    $scope.potentialUsers[i].locked = false;
                    $scope.$apply();
                    break;
                }
            }
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

        $scope.predicate = 'dateAdded';  // Default sorting
        $scope.reverse = false;

        // If the admin leaves this state (without heading to processing) make sure to unlock the selected users (if any).
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                if (fromState.name === 'processSelection' && toState.name !== 'process') {
                    console.log('Left processingSelection without going to processing');
                    var selectedUsers = $scope.potentialUsers.filter( function ( user ) {
                        return user.selected;
                    });
                    selectedUsers.forEach( function ( user ) {
                        $window.socket.emit('potential:release', user._id);
                    });
                }
            });

    }
]);