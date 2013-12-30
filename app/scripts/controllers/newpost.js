'use strict';

angular.module('todo')
.controller('NewpostCtrl', function ($scope, $routeParams, $location, $window, Projects) {
	$scope.projects = Projects.all();
	$scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

	$scope.createPost = function(post) {
		if(!$scope.activeProject) {
	  		return;
		}
		$scope.activeProject.posts.push({
	  		id: $scope.activeProject.posts.length,
	  		title: post.title,
	  		comments: []
		});

		$window.history.back();

		// Inefficient, but save all the projects
		Projects.save($scope.projects);

		post.title = '';
	};

	$scope.rightButtons = [
	    { 
	      type: 'button-clear',
	      content: '<i class="icon ion-android-send"></i>',
	      tap: function(e) {
	          $scope.createPost($scope.post);
	      }
	    }
	]	

});
