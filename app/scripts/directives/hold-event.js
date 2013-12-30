'use strict';

angular.module('final', [])
  .directive('holdSelect', function (Gesture) {
    return {
		restrict: 'C',
		link: function($scope, $element, $attr) {
			var output = angular.element(document.getElementById('output'));

			// Debug output function
			var o = function(type, d) {
				/*
				var p = ['<div>' + type + ' event: '];
				for(var i = 0; i < d.length; i++) {
					p.push(d[i]);
				}
				p.push('</div>');
				output.append(p.join(', '));
				$element[0].scrollTop = $element[0].scrollHeight;
				*/
				console.log("o: "+type);
			};

			var releaseFn = function(e) {
				o('release', [e.gesture.touches[0].pageX, e.gesture.touches[0].pageY]);
			};
			var releaseGesture = Gesture.on('release', releaseFn, $element);

			var holdFn = function(e) {
				o('hold', [e.gesture.touches[0].pageX, e.gesture.touches[0].pageY]);
			};
			var holdGesture = Gesture.on('hold', holdFn, $element);

			$scope.$on('$destroy', function () {
				Gesture.off(holdGesture, 'hold', holdFn);
				Gesture.off(releaseGesture, 'release', releaseFn);
			});
		}
	};
});
