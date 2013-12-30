'use strict';

angular.module('todo')
.controller('Test2Ctrl', function($scope) {
        // Build Mock Data
        $scope.items = [];
        for(var i = 0; i < 3; i++) {
          $scope.items.push({
            text: i
          });
        }

        // List Toggles
        $scope.isDeletingItems = true;
        $scope.editBtnText = 'Edit';
        $scope.toggleDelete = function() {
          $scope.isDeletingItems = !$scope.isDeletingItems;
          $scope.isReorderingItems = false;
          $scope.editBtnText = ($scope.isDeletingItems ? 'Done' : 'Edit');
        };
        $scope.reorderBtnText = 'Reorder';
        $scope.toggleReorder = function() {
          $scope.isReorderingItems = !$scope.isReorderingItems;
          $scope.isDeletingItems = false;
          $scope.reorderBtnText = ($scope.isReorderingItems ? 'Done' : 'Reorder');
        };

		$scope.onListHold = function(e)	{
			console.log("OnListHold");
			$scope.toggleDelete();
		}


        // Item Methods/Properties
        $scope.deleteItem = function(item) {
          alert('onDelete from the "item" directive on-delete attribute. Lets not delete this item today ok!');
        };
        $scope.deleteListItem = function(item) {
          alert('onDelete from the "list" on-delete attribute');
          $scope.items.splice($scope.items.indexOf(item), 1);
        };

        $scope.optionButtons1 = [
          {
            text: 'Edit',
            onTap: function(item, button) { alert(button.text + ' Button: ' + item.text) }
          },
          {
            text: 'Share',
            onTap: function(item, button) { alert(button.text + ' Button: ' + item.text) }
          }
        ];

        $scope.optionButtons2 = [
          {
            text: 'Cancel',
            onTap: function() { alert('CANCEL!') }
          },
          {
            text: 'Submit',
            onTap: function() { alert('SUBMIT!') }
          }
        ];

        $scope.urlItems = [
          { text: 'Biography', icon: 'ion-person', url: 'http://en.wikipedia.org/wiki/Nicolas_Cage' },
          { text: 'Fan Club', icon: 'ion-star', url: 'http://cagealot.com/' }
        ];
});
