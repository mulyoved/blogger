'use strict';

describe('Controller: TestQCtrl', function () {

  // load the controller's module
  beforeEach(module('todoApp'));

  var TestQCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TestQCtrl = $controller('TestQCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
