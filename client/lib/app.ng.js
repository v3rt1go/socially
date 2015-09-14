(function() {
  'use strict';

  angular.module('socially', ['angular-meteor', 'ui.router', 'angularUtils.directives.dirPagination', 'uiGmapgoogle-maps', 'ui.bootstrap']);

  // Bootstrap angular application - avoid using ng-app in body
  // to support multiple ready events from different platforms
  // -- this is done for mobile support
  function onReady() {
    angular.bootstrap(document, ['socially']);
  }

  if (Meteor.isCordova) {
    angular.element(document).on('deviceready', onReady);
  } else {
    angular.element(document).ready(onReady);
  }

}());
