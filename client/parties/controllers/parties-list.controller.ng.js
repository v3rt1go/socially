/* globals Parties */
(function() {
  'use strict';

  var PartiesListController = function($meteor) {
    // This basically replaces $scope [Y032 style]
    // $scope still has it's uses like for example $scope.$watch or other
    // methods that are directly bound to $scope, but this way we can separate
    // the $scope specific logic from our controller specific methods
    var vm = this;

    // We have to subscribe to the parties publication sent from the server
    // we could use $meteor.subscribe('parties') => returns a promise
    // or we can use .subscribe() on the AngularMeteorCollection below
    // this does not return a promise
    // vm.parties = $meteor.collection(Parties).subscribe('parties');
    // !!! We resolved the subscription in the routes file
    vm.parties = $meteor.collection(Parties);
    vm.remove = function(party) {
      // We could use splice like a normal js array, but the AngularMeteorCollection
      // array has save and remove methods, with better performance and syntax
      // vm.parties.splice(vm.parties.indexOf(party), 1);
      vm.parties.remove(party);
    };
    vm.removeAll = function() {
      vm.parties.remove();
    };
  };

  // By naming our file with .ng.js meteor-angular will take care of the minification
  // process, simillar to ng-annotate so we don't have to use strings for our vars
  // app.controller('PartiesListCtrl', ['$scope', PartiesListCtrl]);
  angular.module('socially').controller('PartiesListController', ['$meteor', PartiesListController]);
}());
