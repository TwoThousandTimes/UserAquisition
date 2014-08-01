'use strict';

angular.module('mean.system').controller('ProcessController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers) {
        $scope.global = Global;
        $scope.selectedUsers = $scope.global.selectedUsers;
        $scope.selectedUser = {};

        $scope.markAsProcessed = function( pUser ) {
            PotentialUsers.process( pUser ).success(function() {
                // 1. TODO: Mark the user as processed in the view

            }).error(function() {
                // TODO: Alert the admin that the user was not properly processed!

            });
        };

        $scope.setActiveUser = function( pUser ) {
            console.log(pUser);
            pUser.processing.siteReferedTo = '';
            $scope.selectedUser = pUser;
            $scope.$apply();
        };
    }
]);