(function() {
  'use strict';

  angular.module('socially', ['angular-meteor', 'ui.router']);
  angular.module('socially').config((['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {
      // Enforce HTML5 mode
      $locationProvider.html5Mode(true);

      //Route definitions
      $stateProvider
        .state('parties', {
          url: '/parties',
          templateUrl: 'client/views/parties-list.view.ng.html',
          controller: 'PartiesListController',
          controllerAs: 'partiesVm'
        })
        .state('partyDetails', {
          url: '/parties/:partyId',
          templateUrl: 'client/views/party-details.view.ng.html',
          controller: 'PartyDetailsController',
          controllerAs: 'partyVm'
        });

      // Catch all route (default)
      $urlRouterProvider.otherwise('/parties');
    }
  ]));

}());
