'use strict';

angular.module('mean.system').controller('ProcessController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers', '$sce', '$state',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers, $sce, $state) {
        $scope.global = Global;
        $scope.selectedUsers = $scope.global.selectedUsers;

        // If we have no users selected, go back to user selection
        if (!$scope.selectedUsers) {
            $state.go('processSelection');
        }

        $scope.selectedUser = {};

        $scope.markAsProcessed = function( pUser ) {
            PotentialUsers.process( pUser ).success( function ( response ) {
                // 1. TODO: Mark the user as processed in the view
                pUser.processing.isProcessed = true;
                $scope.selectedUser = {};  // Deselect the user
            }).error( function() {
                pUser.error = true;
            });
        };

        $scope.undoProcess = function ( pUser ) {
            PotentialUsers.undoProcess( pUser ).success( function ( response ) {
                pUser.processing.isProcessed = false;
                $scope.selectedUser = {};
            }).error( function () {
                pUser.error = true;
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

        // If the admin leaves the processing page, unlock all of those potential users that were currently locked.
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                if (fromState.name === 'process') {
                    $scope.selectedUsers.forEach( function ( user ) {
                        $window.socket.emit('potential:release', user._id);
                    });
                }
            });
    }
]);