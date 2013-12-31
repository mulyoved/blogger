'use strict';

angular.module('todo')
.controller('Test2Ctrl', function($scope) {

	$scope.$on('event:google-plus-signin-success', function (event,authResult) {
		console.log("Send login to server or save into cookie");
	});
	$scope.$on('event:google-plus-signin-failure', function (event,authResult) {
		console.log("Auth failure or signout detected");
	});	
});
