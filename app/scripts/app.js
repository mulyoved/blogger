'use strict';

angular.module('todo', [
//  'ngResource',
//  'ngSanitize',
  'ngAnimate',
  'ngRoute',
  'ionic'
])

.config(function ($compileProvider){
  // Needed for routing to work
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.config(function($routeProvider, $locationProvider) {

  // Set up the initial routes that our app will respond to.
  // These are then tied up to our nav router which animates and
  // updates a navigation bar
  $routeProvider.when('/home', {
    templateUrl: 'views/main.html',
  });

  // if the url matches something like /pet/2 then this route
  // will fire off the PetCtrl controller (controllers.js)
  $routeProvider.when('/post/:postId', {
    templateUrl: 'views/post.html',
    controller: 'PostCtrl'
  });

  // if none of the above routes are met, use this fallback
  // which executes the 'AppCtrl' controller (controllers.js)
  $routeProvider.otherwise({
    redirectTo: '/home'
  });

});
