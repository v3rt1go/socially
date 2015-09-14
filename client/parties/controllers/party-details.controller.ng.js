(function() {
  'use strict';

  var PartyDetailsController = function($scope, $meteor, $stateParams, $log) {
    var vm = this;
    // $meteor.object takes an optional third argument, that defaults to true.
    // If set to false, the returned meteor object will not support live edits,
    // meaning that changes on the object won't be updated with the server on each
    // change, but an actual - classic - save must be provided
    // vm.party = $meteor.object(Parties, $stateParams.partyId);
    vm.party = $meteor.object(Parties, $stateParams.partyId, false);

    // We have to subscribe to the users publication sent from the server
    // we could use $meteor.subscribe('users') => returns a promise
    // or we can use .subscribe() on the AngularMeteorCollection below
    // this does not return a promise
    // vm.parties = $meteor.collection(Meteor.users).subscribe('users');
    // !!! We resolved the subscription in the routes file
    vm.users = $meteor.collection(Meteor.users, false);

    // We are going to subscribe to the parties publication from the controller
    // using $scope.$meteorSubscribe in order to stop the subscription when the
    // ctrl is closed. This way we won't override the parties subscription from the
    // list controller, when we hit back in the browser and return to it
    $scope.$meteorSubscribe('parties');

    // If we want to control when a subscription is closed, and not rely on the
    // controller to close and $scope to be destoyed - which closes the subscription
    // we can use then on the $meteorSubscribe promise to get a handle for the
    // subscription:
    // var partiesSubscriptionHandle = null;
    // $scope.$meteorSubscribe('parties').then(function(subscriptionHandle) {
    //   partiesSubscriptionHandle = subscriptionHandle;
    // });
    // // and when we want to close the subscription we simply do:
    // partiesSubscriptionHandle.stop();

    // This map propery object is interpreted by the ui-gmap-google-map directive
    // added from meteor add angularui:angular-google-maps

    /*
      What happened here:

      We added the click event to the map. Every time the user clicks the map, we take the location
      from the click event's params and save it as the party's new location. Notice that in the end we
      call $scope.$apply(); this is because that event comes outside of Angular and we need to let Angular
      know that something has change so it will run another $digest cycle.
      We defined the options object under the marker to specify the marker is draggable.
      We handled the dragend event that happens when the marker is droped in a new location.
      We take the location from the event's params and save it as the party's new location.
    */
    vm.map = {
      center: { latitude: 45, longitude: -73 },
      zoom: 8,
      events: {
        click: function (mapModel, eventName, originalEventArgs) {
          if (!vm.party)
            return;

          if (!vm.party.location)
            vm.party.location = {};

          vm.party.location.latitude = originalEventArgs[0].latLng.lat();
          vm.party.location.longitude = originalEventArgs[0].latLng.lng();
          // $scope apply required because this event handler is outside of the angular domain
          // ie: in the google maps embedded frame
          $scope.$apply();
        }
      },
      marker: {
        options: { draggable: true },
        events: {
          dragend: function (marker, eventName, args) {
            if (!vm.party.location)
              vm.party.location = {};

            vm.party.location.latitude = marker.getPosition().lat();
            vm.party.location.longitude = marker.getPosition().lng();
          }
        }
      }
    };

    vm.save = function() {
      // AngularMeteorObject save method saves the current value of the object to
      // the server mongo db. save() returns a promise with the # of objects affected
      // on success or an error if error
      vm.party.save()
        .then(function(numberOfDocs) {
          $log.info('save success doc affected ', numberOfDocs);
        }, function(error) {
          $log.error('save error', error);
        });
    };
    vm.reset = function() {
      // AngularMeteorObject reset() resets the client object to the value stored in the
      // server mongo db
      vm.party.reset();
    };

    // We use the $meteor.call('methodname', arguments) syntax to call a Meteor method
    // defined in the model class. Metheor methods return promises with a callback of
    // function(data, err)
    vm.invite = function(user) {
      $log.info('trying to invite');
      $meteor.call('invite', vm.party._id, user._id)
      .then(function(data) {
        $log.info('success invinting', data);
      }, function(err) {
        $log.error('error inviting', err);
      });
    };
    // We use the canInvite function to determine if the user can invite other
    // users to the party (party is not public, and user is owner of the party)
    vm.canInvite = function() {
      if (!vm.party) {
        return false;
      }

      return !vm.party.public && vm.party.owner === Meteor.userId();
    };
  };

  angular.module('socially').controller('PartyDetailsController', ['$scope', '$meteor', '$stateParams', '$log', PartyDetailsController]);
}());
