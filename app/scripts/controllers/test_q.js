'use strict';

angular.module('todo')
.controller('TestQCtrl', function ($scope, $log, $q, blogdb) {
	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];


	function asyncGreet(name) {
		var deferred = $q.defer();
	 
		setTimeout(function() {
			// since this fn executes async in a future turn of the event loop, we need to wrap
			// our code into an $apply call so that the model changes are properly observed.
			$scope.$apply(function() {
				//deferred.notify('About to greet ' + name + '.');
	 
				if (name != 'err') {
					deferred.resolve('Hello, ' + name + '!');
				} else {
					deferred.reject('Greeting ' + name + ' is not allowed.');
				}
			});
		}, 1000);
	 
		return deferred.promise;
	}

	var greet2 = function() {
		var prom = asyncGreet('Greet#1').
		then(function(greeting) {
			$log.log('Success: ',greeting);
			return asyncGreet('Greet#2');
		});

		return prom;
	};

	var prommiseArray = function(arr, promise) {
		var item = arr.pop();
		var p = promise(item).
		then(function(greeting) {
			$log.log('Success: ',greeting);
			if (arr.length > 0) {
				return prommiseArray(arr, promise);
			}
			else {
				return 0;				
			}
		});

		return p;
	}

	$scope.test_QArray = function() {
		$log.log('Start test_QArray');
		var arr = ['greet1', 'err', 'greet3'];
		prommiseArray(arr, asyncGreet).
		then(function(greeting) {
			$log.log('Success: ',greeting);
		}	, function(reason) {
			$log.error('Failed: ',reason);
		});

		$log.log('End test_QArray');

	}

	$scope.test001 = function() {

		$log.log('Start Test001');

		greet2().
		then(function(greeting) {
			$log.log('Success: ',greeting);
		}	, function(reason) {
			$log.error('Failed: ',reason);
		});

		$log.log('End Test001');

		/*
		setTimeout(function() {
			$log.log('Timeout');
		}, 500);
		$log.log('End Test001');

		var promise = asyncGreet('Robin Hood');
		promise.then(function(greeting) {
		  alert('Success: ' + greeting);
		}, function(reason) {
		  alert('Failed: ' + reason);
		}, function(update) {
		  alert('Got notification: ' + update);
		});
		*/
	};

	$scope.test_db_change_ID = function() {
		var doc = {
			id: 'id1',
			data: 'data1',
			key: 'key1',
		}
		blogdb.post(doc).then(function(answer) {
			$log.log('post', answer);

			doc.id = 'id2';
		}, function(reason) {
			$log.error('Post failed', reason);
		})
	}

});
