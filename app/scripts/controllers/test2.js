'use strict';

angular.module('todo')
.controller('Test2Ctrl', function($scope, $log, GAPI, Blogger) {

	$scope.$on('event:google-plus-signin-success', function (event,authResult) {
		console.log("Send login to server or save into cookie");
	});
	$scope.$on('event:google-plus-signin-failure', function (event,authResult) {
		console.log("Auth failure or signout detected");
	});	

	$scope.authorize = function () {
		GAPI.init(); 
	}

	$scope.answer = "";
	$scope.getBlogByUrl = function() {
		$log.log("getBlogByUrl");


		$scope.answer = Blogger.getBlogByUrl({'url': 'http://finalworksample.blogspot.co.il/'});
	}
});
