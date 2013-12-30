'use strict';

angular.module('todo')
.controller('PostCtrl', function ($scope, $routeParams, $location, $window, Modal, Projects) {
	// Load or initialize projects
	$scope.projects = Projects.all();
	$scope.post = $scope.projects[Projects.getLastActiveIndex()].posts[$routeParams.postId];

	var rightButtonsOnNew = [
		{
			type: 'button-clear',
			content: '<i class="icon ion-plus-round"></i>',
			tap: function(e) {
				$location.path( '/newcomment/' + $scope.post.id );
			}
		}
	];
	var rightButtonsOnDelete = [
		{
			type: 'button-clear',
			content: '<i class="icon ion-close-round"></i>',
			tap: function(e) {
			    $scope.isDeletingItems = false;
				$scope.rightButtons = rightButtonsOnNew;
			}
		}
	];

	$scope.rightButtons = rightButtonsOnNew;

	$scope.isDeletingItems = false;
    $scope.toggleDelete = function() {
	    $scope.isDeletingItems = true; //!$scope.isDeletingItems;
		$scope.rightButtons = rightButtonsOnDelete;
    };

	$scope.onListHold = function(e)	{
		$scope.toggleDelete();
	}

	$scope.deleteItem = function(comment) {
		if ($window.confirm('Are you sure you want to delete comment?')) {
			$scope.$eval($scope.deleteComment(comment));
		}
	};

	function indexOf(array, obj) {
	  if (array.indexOf) return array.indexOf(obj);

	  for ( var i = 0; i < array.length; i++) {
	    if (obj === array[i]) return i;
	  }
	  return -1;
	}

	function arrayRemove(array, value) {
	  var index = indexOf(array, value);
	  if (index >=0)
	    array.splice(index, 1);
	  return value;
	}

	$scope.deleteComment = function(comment) {
		console.log("deleteComment: "+ comment.title);
		//$scope.persons.splice(idx, 1);
		arrayRemove($scope.post.comments, comment);
		Projects.save($scope.projects);
	}

});
