'use strict';

angular.module('todo')
.controller('PostCtrl', function ($scope) {
	$scope.post = {
		text: 'Post Text4'
	}


	$scope.leftButtons = [
	    { 
	      type: 'button-clear',
	      content: '<i class="icon ion-arrow-left-c"></i>',
	      tap: function(e) {
	      }
	    }
	];
	$scope.rightButtons = [
	    { 
	      type: 'button-clear',
	      content: '<i class="icon ion-plus-round"></i>',
	      tap: function(e) {
	      }
	    }
	]	
});
