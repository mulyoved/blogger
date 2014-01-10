'use strict';

angular.module('todo', [
//  'ngResource',
//  'ngSanitize',
  'ngAnimate',
  'ngRoute',
  'checklist-model',
  'directive.g+signin',
  'final',
  'gapi',
  'pouchdb',
  'ionic'
])

.config(function ($compileProvider){
  // Needed for routing to work
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})
.value('GoogleApp', {
    apiKey: 'AIzaSyA78RO9-B7qEr-WXJULOq3u-n4C7RS9wz4',
    clientId: '44535440585-rshs1j4t1jc4qnp295fqmkr7jt12tbrh.apps.googleusercontent.com',
    scopes: [
      // whatever scopes you need for your app, for example:
      //'https://www.googleapis.com/auth/drive',
      //'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/blogger'
    ]  
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

  $routeProvider.when('/newpost', {
    templateUrl: 'views/newpost.html',
    controller: 'NewpostCtrl'
  });

  $routeProvider.when('/newcomment/:postId', {
    templateUrl: 'views/newcomment.html',
    controller: 'NewcommentCtrl'
  });

  $routeProvider.when('/test', {
    templateUrl: 'views/test.html',
  });

  $routeProvider.when('/test2', {
    templateUrl: 'views/test2.html',
    controller: 'Test2Ctrl'
  });

  $routeProvider.when('/testq', {
    templateUrl: 'views/test_q.html',
    controller: 'TestQCtrl'
  });

  // if none of the above routes are met, use this fallback
  // which executes the 'AppCtrl' controller (controllers.js)
  $routeProvider.otherwise({
    redirectTo: '/home'
  });

}).
factory('blogdb', function(pouchdb) {
  return pouchdb.create('blogdb');
});

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

var date2GAPIDate = function (date) {
 var pad = function (amount, width) {
  var padding = "";
  while (padding.length < width - 1 && amount < Math.pow(10, width - padding.length - 1))
   padding += "0";
  return padding + amount.toString();
 }
 date = date ? date : new Date();
 var offset = date.getTimezoneOffset();
 return pad(date.getFullYear(), 4)
   + "-" + pad(date.getMonth() + 1, 2)
   + "-" + pad(date.getDate(), 2)
   + "T" + pad(date.getHours(), 2)
   + ":" + pad(date.getMinutes(), 2)
   + ":" + pad(date.getSeconds(), 2)
   + "." + pad(date.getMilliseconds(), 3)
   + (offset > 0 ? "-" : "+")
   + pad(Math.floor(Math.abs(offset) / 60), 2)
   + ":" + pad(Math.abs(offset) % 60, 2);
}
