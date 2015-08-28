(function() {
  'use strict';

  var PartyDetailsController = function($meteor, $stateParams, $log) {
    var vm = this;
    // $meteor.object takes an optional third argument, that defaults to true.
    // If set to false, the returned meteor object will not support live edits,
    // meaning that changes on the object won't be updated with the server on each
    // change, but an actual - classic - save must be provided
    // vm.party = $meteor.object(Parties, $stateParams.partyId);
    vm.party = $meteor.object(Parties, $stateParams.partyId, false);

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

  angular.module('socially').controller('PartyDetailsController', ['$meteor', '$stateParams', '$log', PartyDetailsController]);
}());
