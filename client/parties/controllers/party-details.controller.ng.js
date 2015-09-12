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
  };

  angular.module('socially').controller('PartyDetailsController', ['$scope', '$meteor', '$stateParams', '$log', PartyDetailsController]);
}());
