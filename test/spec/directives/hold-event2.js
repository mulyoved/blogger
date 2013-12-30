'use strict';

describe('Directive: holdEvent2', function () {

  // load the directive's module
  beforeEach(module('todoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<hold-event2></hold-event2>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the holdEvent2 directive');
  }));
});
