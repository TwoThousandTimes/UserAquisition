'use strict';

//Setting up route
angular.module('mean.system').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // For unmatched routes:
    $urlRouterProvider.otherwise('/');

    // states for my app
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'system/views/index.html'
      })
      .state('potentialsNew', {
        url: '/potentials/new',
        templateUrl: 'system/views/potentials.new.html'
      })
      .state('process', {
        url: '/process',
        templateUrl: 'system/views/process.html'
      })
      .state('processSelection', {
        url: '/process/selection',
        templateUrl: 'system/views/process.selection.html'
      });
  }
]).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
