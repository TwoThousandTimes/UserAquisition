'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$window', '$rootScope', 'Global', 'Menus', '$http',
  function($scope, $window, $rootScope, Global, Menus, $http) {
    $scope.global = Global;
    $scope.menus = {};

    // Default hard coded menu items for main menu
    var defaultMainMenu = [];

    // Query menus added by modules. Only returns menus that user is allowed to see.
    function queryMenu(name, defaultMenu) {

      Menus.query({
        name: name,
        defaultMenu: defaultMenu
      }, function(menu) {
        $scope.menus[name] = menu;
      });
    }

    // Query server for menus and check permissions
    queryMenu('main', defaultMainMenu);

    $scope.isCollapsed = false;

    $rootScope.$on('loggedin', function() {

      queryMenu('main', defaultMainMenu);

      $scope.global = {
        authenticated: !! $rootScope.user,
        user: $rootScope.user
      };
    });

    $http.get('/potential/stats').success( function(data) {
      $scope.numProcessed = data.numProcessed;
      $scope.numUnprocessed = data.numUnprocessed;
    });

    // Handle Socket events (ie update user numbers)

    $window.socket.on('potential:new', function ( user ) {
        $scope.numUnprocessed++;
        $scope.$apply();  // update the view
    });

    $window.socket.on('potential:processed', function ( id ) {
        $scope.numUnprocessed--;
        $scope.numProcessed++;
        $scope.$apply();
    });

  }
]);
