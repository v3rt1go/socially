(function() {
  'use strict';

  angular.module('socially').run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function(event, next, previous, error) {
      // We can catch the error thrown when the $requireUser promise is rejected
      // and redirect the user back to the main page
      if (error === 'AUTH_REQUIRED') {
        $state.go('/parties');
      }
    });
  }]);

  angular.module('socially').config((['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {
      // Enforce HTML5 mode
      $locationProvider.html5Mode(true);

      //Route definitions
      $stateProvider
        .state('parties', {
          url: '/parties',
          templateUrl: 'client/parties/views/parties-list.view.ng.html',
          controller: 'PartiesListController',
          controllerAs: 'partiesVm'
        })
        .state('partyDetails', {
          url: '/parties/:partyId',
          templateUrl: 'client/parties/views/party-details.view.ng.html',
          controller: 'PartyDetailsController',
          controllerAs: 'partyVm',
          resolve: {
            'currentUser': ['$meteor', function($meteor) {
              return $meteor.requireUser();
            }]
          }
        });

      // Catch all route (default)
      $urlRouterProvider.otherwise('/parties');
    }
  ]));
}());
