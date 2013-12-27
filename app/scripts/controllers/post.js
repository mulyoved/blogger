'use strict';

angular.module('todo')
.controller('PostCtrl', function ($scope, Modal) {
	$scope.post = {
		text: 'Post Text4'
	}


  // Create our modal
  Modal.fromTemplateUrl('views/newcomment.html', function(modal) {
    $scope.commentModal = modal;
  }, {
    scope: $scope
  });

  $scope.createComment = function(comment) {
    if(!$scope.activeProject) {
      return;
    }
    $scope.activePost.comments.push({
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
