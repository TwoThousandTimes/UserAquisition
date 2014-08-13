'use strict';

var ModalInstanceCtrl = function ($scope, $modalInstance, username, message) {
    $scope.username = username;
    $scope.message = message ? message : '(No message and/or comments)';

    $scope.ok = function () {
        $modalInstance.close();
    };
};

angular.module('mean.system').controller('ProcessedPotentialsController', ['$scope', '$rootScope', '$window', 'Global', '$http', 'PotentialUsers', '$state', '$modal',
    function($scope, $rootScope, $window, Global, $http, PotentialUsers, $state, $modal) {
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

        $scope.openModal = function ( username, message ) {

            $modal.open({
                templateUrl: 'messageModal.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    username: function () {
                        return username;
                    },
                    message: function() {
                        return message;
                    }
                }
            });

        };
    }
]);
