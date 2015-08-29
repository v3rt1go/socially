(function() {
  'use strict';

  // We use the run block to redirect any state that has AUTH_REQUIRED to /parties
  angular.module('socially').run(['$rootScope', '$state', function($rootScope, $state) {
    // eslint throws an error here, because we should destroy this listner when the
    // scope is also destroyed, with scope.on('$destroy', listner); but since we
    // keep this listenr in the app run block - it lives as long as the app lives
    // so there's no point in destroying it
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
          controllerAs: 'vm'
        })
        .state('partyDetails', {
          url: '/parties/:partyId',
          templateUrl: 'client/parties/views/party-details.view.ng.html',
          controller: 'PartyDetailsController',
          controllerAs: 'partyVm',
          resolve: {
            'currentUser': ['$meteor', function($meteor) {
              return $meteor.requireUser();
            }],
            'usersSubscription': ['$meteor', function($meteor) {
              return $meteor.subscribe('users');
            }],
            'partiesSubscription': ['$meteor', function($meteor) {
              return $meteor.subscribe('parties');
            }]
          }
        });

      // Catch all route (default)
      $urlRouterProvider.otherwise('/parties');
    }
  ]));
}());
