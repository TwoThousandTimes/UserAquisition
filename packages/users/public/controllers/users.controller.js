'use strict';

angular.module('mean.system').controller('UsersController', ['$scope', '$rootScope', '$window', 'Global', '$http',
    function($scope, $rootScope, $window, Global, $http) {
        $scope.global = Global;
        $scope.users = [];

        $http.get('/users/all').success(function ( users ) {
           $scope.users = users; 
        }).error( function () {

        });
    }
]);