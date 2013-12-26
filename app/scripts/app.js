'use strict';

angular.module('todo', [
//  'ngResource',
//  'ngSanitize',
//  'ngRoute',
  'ionic'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
