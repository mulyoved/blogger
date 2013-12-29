'use strict';

angular.module('todo')
.controller('MainCtrl', function($scope, $timeout, Modal, Projects) {

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

  // Create our modal
  Modal.fromTemplateUrl('views/newpost.html', function(modal) {
    $scope.postModal = modal;
  }, {
    scope: $scope
  });

  $scope.createPost = function(post) {
    if(!$scope.activeProject) {
      return;
    }
    $scope.activeProject.posts.push({
      id: $scope.activeProject.posts.length,
      title: post.title,
      comments: []
    });
    $scope.postModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);

    post.title = '';
  };

  $scope.newPost = function() {
    $scope.postModal.show();
  };

  $scope.closeNewPost = function() {
    $scope.postModal.hide();
  };

  /*
  $scope.toggleProjects = function() {
    $scope.sideMenuController.toggleLeft();
  };
  */

  $scope.selectPost = function(post, index) {
    $scope.activePost = post;
    console.log('selectPost: '+post.title);
  };

  $scope.leftButtons = [
      { 
        type: 'button-clear',
        content: '<i class="icon ion-gear-b"></i>',
        tap: function(e) {
        }
      }
  ];

  $scope.rightButtons = [
      { 
        type: 'button-clear',
        content: '<i class="icon ion-plus-round"></i>',
        tap: function(e) {
          $scope.newPost();
        }
      }
  ] 


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