/* globals Parties */
(function() {
  'use strict';

  var PartiesListController = function($log, $scope, $meteor) {
    // This basically replaces $scope [Y032 style]
    // $scope still has it's uses like for example $scope.$watch or other
    // methods that are directly bound to $scope, but this way we can separate
    // the $scope specific logic from our controller specific methods
    var vm = this;

    // PAGINATION:
    // In order to support pagination on the client and server slide
    // for the parties publication we have to subscribe to it using
    // $meteor.subscribe from the controller, and not resolve it in
    // the routes file. The route is not aware of the active page
    // of the controller etc.
    vm.page = 1;
    vm.perPage = 3;
    vm.sort = { name: 1 };
    vm.orderProperty = '1';

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
      });
    });


    // SORTING:
    // we also need to add the sort modifier to the way we get the collection data
    // from the Minimongo. That is because the sorting is not saved when the data is
    // sent from the server to the client. So to make sure our data is sorted also on
    // the client need to defined is also in the parties collection.
    // vm.parties = $meteor.collection(Parties); By calling Parties in collection
    // this way we return the record set. If we provide a function as an argument
    // with return Parties.find() we'll return a cursor, which is more efficient:
    vm.parties = $meteor.collection(function () {
      return Parties.find({}, {
        sort: $scope.getReactively('vm.sort')
      });
    });
    // We watch the vm.orderProperty var and when it changes we update vm.sort
    // since sort is encapsulated in a meteor reactive var it will also update
    // the mongo subscription
    $scope.$watch('vm.orderProperty', function(){
      if (vm.orderProperty)
        vm.sort = {name: parseInt(vm.orderProperty)};
    });

    // METHODS
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
  };

  // By naming our file with .ng.js meteor-angular will take care of the minification
  // process, simillar to ng-annotate so we don't have to use strings for our vars
  // app.controller('PartiesListCtrl', ['$scope', PartiesListCtrl]);
  angular.module('socially').controller('PartiesListController', ['$log', '$scope', '$meteor', PartiesListController]);
}());
