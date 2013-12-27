'use strict';

angular.module('todo')
.controller('PostCtrl', function ($scope) {
	$scope.post = {
		text: 'Post Text4'
	}


	$scope.rightButtons = [
	    { 
	      type: 'button-clear',
	      content: '<i class="icon ion-plus-round"></i>',
	      tap: function(e) {
	      }
	    }
	]	
});
