(function() {
  'use strict';

  var PartyDetailsController = function($stateParams) {
    var vm = this;
    vm.partyId = $stateParams.partyId;
  };

  angular.module('socially').controller('PartyDetailsController', ['$stateParams', PartyDetailsController]);
}());
