(function() {
  'use strict';

  var AddNewPartyController = function($rootScope, $modalInstance, parties) {
    var vm = this;

    vm.addNewParty = function() {
      vm.newPary.owner = $rootScope.currentUser._id;
      parties.push(vm.newParty);
      vm.newParty = '';
      $modalInstance.close();
    };
  };

  angular.module('socially').controller('AddNewPartyController', ['$rootScope', '$modalInstance', 'parties', AddNewPartyController]);
}());
