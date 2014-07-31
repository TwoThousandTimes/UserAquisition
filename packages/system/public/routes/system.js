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
      .state('potentials-new', {
        url: '/potentials/new',
        templateUrl: 'system/views/potentials.new.html'
      })
      .state('processing', {
        url: '/processing',
        templateUrl: 'system/views/processing.html'
      })
      .state('processing-selection', {
        url: '/processing/selection',
        templateUrl: 'system/views/processing.selection.html'
      });
  }
]).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
