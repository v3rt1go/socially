/* globals Parties */
(function() {
  'use strict';

  var PartiesListController = function($log, $rootScope, $scope, $meteor, $state, $modal) {
    // This basically replaces $scope [Y032 style]
    // $scope still has it's uses like for example $scope.$watch or other
    // methods that are directly bound to $scope, but this way we can separate
    // the $scope specific logic from our controller specific methods
    var vm = this;

    var styles1 = [
      {
        "featureType": "landscape.natural",
        "elementType": "geometry.fill",
        "stylers": [{"visibility": "on"}, {"color": "#e0efef"}]
      }, {
        "featureType": "poi",
        "elementType": "geometry.fill",
        "stylers": [{"visibility": "on"}, {"hue": "#1900ff"}, {"color": "#c0e8e8"}]
      }, {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{"lightness": 100}, {"visibility": "simplified"}]
      }, {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [{"visibility": "off"}]
      }, {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [{"visibility": "on"}, {"lightness": 700}]
      }, {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{"color": "#7dcdcd"}]}
    ];
    var styles2 = [
      {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#444444"}]
      }, {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{"color": "#f2f2f2"}]
      }, {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{"visibility": "off"}]
      }, {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{"saturation": -100}, {"lightness": 45}]
      }, {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{"visibility": "simplified"}]
      }, {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
      }, {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{"visibility": "off"}]
      }, {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
      }
    ];

    // PAGINATION:
    // In order to support pagination on the client and server slide
    // for the parties publication we have to subscribe to it using
    // $meteor.subscribe from the controller, and not resolve it in
    // the routes file. The route is not aware of the active page
    // of the controller etc.
    vm.page = 1;
    vm.perPage = 3;
    vm.sort = {
      name: 1
    };
    vm.orderProperty = '1';

    // SORTING:
    // we also need to add the sort modifier to the way we get the collection data
    // from the Minimongo. That is because the sorting is not saved when the data is
    // sent from the server to the client. So to make sure our data is sorted also on
    // the client need to defined is also in the parties collection.
    // vm.parties = $meteor.collection(Parties); By calling Parties in collection
    // this way we return the record set. If we provide a function as an argument
    // with return Parties.find() we'll return a cursor, which is more efficient:
    vm.parties = $meteor.collection(function() {
      return Parties.find({}, {
        sort: $scope.getReactively('vm.sort')
      });
    });

    // Subscribe to the users collection. We use false to not edit on the fly
    // the users collection from minimongo to mongo server
    vm.users = $meteor.collection(Meteor.users, false).subscribe('users');

    /*
      Angular's scope variables are only watched by Angular and are not reactive vars for Meteor...
      For that angular-meteor created getReactively - a way to make an Angular scope
      variable to a reactive variable. In order to make the subscription run each time
      something changes in one of the parameters, we need to place it inside an autorun block.
      To do that, we are going to use the $meteor.autorun function
    */
    $meteor.autorun($scope, function() {
      $meteor.subscribe('parties', {
        // We then use $scope.getReactively('controllerAs.prop_name') to encapsulate the $scope vars
        // that only angular watches in reactive vars that meteor also watches
        limit: parseInt($scope.getReactively('vm.perPage')),
        skip: parseInt(($scope.getReactively('vm.page') - 1) * $scope.getReactively('vm.perPage')),
        sort: $scope.getReactively('vm.sort')
      }, $scope.getReactively('vm.search')).then(function() {
        // when the subcription promise resolves we load the result returned by Counts
        // on the numberOfParties publication on the partiesCount vm prop. We use
        // false as the third argument to avoid changing this from the client
        vm.partiesCount = $meteor.object(Counts, 'numberOfParties', false);

        /*
          Adding to each party a function that handles a click event with the party's specific information
          Initializing the map object
          Defining a function to handle the click. navigates to the party's page.
        */
        vm.parties.forEach( function (party) {
          party.onClicked = function () {
            $state.go('partyDetails', {partyId: party._id});
          };
        });

        vm.map = {
          center: { latitude: 45, longitude: -73 },
          options: { styles: styles2, maxZoom: 10 },
          zoom: 8
        };

      });
    });

    // We watch the vm.orderProperty var and when it changes we update vm.sort
    // since sort is encapsulated in a meteor reactive var it will also update
    // the mongo subscription
    $scope.$watch('vm.orderProperty', function() {
      if (vm.orderProperty)
        vm.sort = {
          name: parseInt(vm.orderProperty)
        };
    });

    // METHODS
    vm.rsvp = function(partyId, rsvp) {
      $meteor.call('rsvp', partyId, rsvp).then(
        function(data) {
          $log.info('RSVP sent', data);
        },
        function(err) {
          $log.error('RSVP error', err);
        }
      );
    };
    // We use underscore's filter, contains and findWhere to find out
    // what users have been invited to the party but have not accepted the
    // invitation yet
    vm.outstandingInvitations = function (party) {
      return _.filter(vm.users, function (user) {
        return (_.contains(party.invited, user._id) &&
        !_.findWhere(party.rsvps, {user: user._id}));
      });
    };
    vm.getUserById = function(userId) {
      return Meteor.users.findOne(userId);
    };
    vm.creator = function(party) {
      if (!party) {
        return;
      }

      var owner = vm.getUserById(party.owner);
      if (!owner) {
        return 'Anonymous';
      }

      if ($rootScope.currentUser)
        if ($rootScope.currentUser._id)
          if (owner._id === $rootScope.currentUser._id)
            return 'me';

      return owner;
    };

    vm.pageChanged = function(newPage) {
      vm.page = newPage;
    };
    vm.delete = function(party) {
      // We could use splice like a normal js array, but the AngularMeteorCollection
      // array has save and remove methods, with better performance and syntax
      // vm.parties.splice(vm.parties.indexOf(party), 1);
      vm.parties.remove(party);
    };
    vm.deleteAll = function() {
      vm.parties.remove();
    };

    // $modal interaction methods added by ui.bootstrap (meteor add angularui:angular-ui-bootstrap@0.13.0)
    vm.openAddNewPartyModal = function () {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'client/parties/views/add-new-party-modal.ng.html',
        controller: 'AddNewPartyCtrl',
        controllerAs: 'vm',
        resolve: {
          parties: function () {
            return vm.parties;
          }
        }
      });

      modalInstance.result.then(function() {}, function() {});
    };
    vm.isRSVP = function (rsvp, party) {
      if (!$rootScope.currentUser._id)
        return false;

      var rsvpIndex = party.myRsvpIndex;
      rsvpIndex = rsvpIndex || _.indexOf(_.pluck(party.rsvps, 'user'), $rootScope.currentUser._id);

      if (rsvpIndex !== -1) {
        party.myRsvpIndex = rsvpIndex;
        return party.rsvps[rsvpIndex].rsvp === rsvp;
      }
    };
  };

  // By naming our file with .ng.js meteor-angular will take care of the minification
  // process, simillar to ng-annotate so we don't have to use strings for our vars
  // app.controller('PartiesListCtrl', ['$scope', PartiesListCtrl]);
  angular.module('socially').controller('PartiesListController', ['$log', '$rootScope', '$scope', '$meteor', '$state', '$modal', PartiesListController]);
}());
