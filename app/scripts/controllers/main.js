'use strict';

angular.module('todo')
.controller('MainCtrl', function($scope, $timeout, $location, $window, Modal, Projects) {

  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  };


  // Load or initialize projects
  $scope.projects = Projects.all();

  // Grab the last active, or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

  // Called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt('Project name');
    if(projectTitle) {
      createProject(projectTitle);
    }
  };

  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    //$scope.sideMenuController.close();
  };

  $scope.itemClick = function(post)
  {
      console.log("itemClick");
      if (!$scope.isDeletingItems)
      {
        $location.path('/post/'+ post.id);
      }
  }

  $scope.leftButtons = [
      { 
        type: 'button-clear',
        content: '<i class="icon ion-gear-b"></i>',
        tap: function(e) {
        }
      }
  ];

  var rightButtonsOnNew = [
      { 
        type: 'button-clear',
        content: '<i class="icon ion-plus-round"></i>',
        tap: function(e) {
          $location.path( '/newpost' );
        }
      },
      { 
        type: 'button-clear',
        content: '<i class="icon ion-android-camera"></i>',
        tap: function(e) {
          $location.path( '/newpost' );
        }
      }
  ] 

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
      $scope.isDeletingItems = true;
      $scope.rightButtons = rightButtonsOnDelete;
    };

  $scope.onListHold = function(e) {
      console.log("onListHold");
    $scope.toggleDelete();
  }

  $scope.deleteItem = function(post) {
    if ($window.confirm('Are you sure you want to delete post?')) {
      $scope.$eval($scope.deletePost(post));
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

  $scope.deletePost = function(post) {
    console.log("deletePost: "+ post.title);
    arrayRemove($scope.activeProject.posts, post);
    Projects.save($scope.projects);
  }

  // Try to create the first project, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if($scope.projects.length === 0) {
      while(true) {
        var projectTitle = prompt('Your first project title:');
        if(projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  });

});