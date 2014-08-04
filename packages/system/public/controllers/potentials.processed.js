'use strict';

angular.module('mean.system').controller('ProcessedPotentialsController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers', '$state',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers, $state) {
        $scope.global = Global;

        PotentialUsers.getProcessedPotentialUsers().success(function ( response ) {
            $scope.processedUsers = response;
        }).error(function () {

        });

        $scope.toggleSuccess = function ( pUser ) {
        	PotentialUsers.toggleSuccess( pUser ).success(function ( response ) {

        	}).error( function () {
        		pUser.error = true;
        	});
        };
    }
]);