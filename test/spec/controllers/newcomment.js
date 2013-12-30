'use strict';

describe('Controller: NewcommentCtrl', function () {

  // load the controller's module
  beforeEach(module('todoApp'));

  var NewcommentCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NewcommentCtrl = $controller('NewcommentCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
