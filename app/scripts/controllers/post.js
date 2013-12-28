'use strict';

angular.module('todo')
.controller('PostCtrl', function ($scope, $routeParams, Modal, Projects) {
  $scope.post = Projects.all()[Projects.getLastActiveIndex()].posts[$routeParams.postId];

  // Create our modal
  Modal.fromTemplateUrl('views/newcomment.html', function(modal) {
    $scope.commentModal = modal;
  }, {
    scope: $scope
  });

  $scope.createComment = function(comment) {
    if(!$scope.post) {
      return;
    }
    $scope.post.comments.push({
      title: comment.title
    });
    $scope.commentModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);

    comment.title = '';
  };

  $scope.newComment = function() {
    $scope.commentModal.show();
  };

  $scope.closeNewComment = function() {
    $scope.commentModal.hide();
  };


	$scope.rightButtons = [
	    { 
	      type: 'button-clear',
	      content: '<i class="icon ion-plus-round"></i>',
	      tap: function(e) {
	          $scope.newComment();
	      }
	    }
	]	
});
