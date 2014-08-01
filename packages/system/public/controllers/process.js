'use strict';

angular.module('mean.system').controller('ProcessController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers', '$sce', '$state',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers, $sce, $state) {
        $scope.global = Global;
        $scope.selectedUsers = $scope.global.selectedUsers;
        $scope.selectedUser = {};

        $scope.markAsProcessed = function( pUser ) {
            PotentialUsers.process( pUser ).success( function ( response ) {
                // 1. TODO: Mark the user as processed in the view
                pUser.processing.isProcessed = true;
                $scope.selectedUser = {};  // Deselect the user
            }).error( function() {
                // TODO: Alert the admin that the user was not properly processed!

            });
        };

        $scope.setActiveUser = function( pUser ) {
            // Make sure the user is not already processed
            if (!pUser.processing.isProcessed) {
                $scope.selectedUser.selected = false; // de-select previous user
                $scope.selectedUser = pUser;
                $scope.selectedUser.contextUrl = $sce.trustAsResourceUrl($scope.selectedUser.contextUrl);
                pUser.selected = true;  // select the current user
            }
        };

        $scope.generateUrl = function ( domain ) {
            var source = $scope.selectedUser.source;
            $scope.selectedUser.processing.siteReferedTo = domain + '/q=' + source;
        };

        // TODO: watch for state change and unlock all users still locked by current admin
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                if (fromState.name === $state.current.name) {
                    $scope.selectedUsers.forEach( function ( user ) {
                        $window.socket.emit('potential:release', user._id);
                    });
                }
            });

        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams){
                console.log('stateChangeSuccess');
                if (fromState.name === 'process') {
                    $window.location.reload();
                    console.log('reload!');
                }
            });
    }
]);