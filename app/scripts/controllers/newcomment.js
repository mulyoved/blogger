'use strict';

angular.module('todo')
  .controller('NewcommentCtrl', function ($scope, $routeParams, $location, $window, Projects) {
  // Load or initialize projects
  $scope.projects = Projects.all();
  $scope.post = $scope.projects[Projects.getLastActiveIndex()].posts[$routeParams.postId];

  $scope.createComment = function(comment) {
    if(!$scope.post) {
      return;
    }
    $scope.post.comments.push({
      id: $scope.post.comments.length,
      title: comment.title
    });
    $window.history.back();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);

    comment.title = '';
  };

	$scope.rightButtons = [
	    { 
	      type: 'button-clear',
	      content: '<i class="icon ion-android-send"></i>',
	      tap: function(e) {
	          $scope.createComment($scope.comment);
	      }
	    }
	]	
});
