/* globals Parties */
'use strict';
var PartiesListCtrl = function($scope, $meteor) {
  $scope.parties = $meteor.collection(Parties);
  $scope.remove = function(party) {
    // We could use splice like a normal js array, but the AngularMeteorCollection
    // array has save and remove methods, with better performance and syntax
    // $scope.parties.splice($scope.parties.indexOf(party), 1);
    $scope.parties.remove(party);
  };
  $scope.removeAll = function() {
    $scope.parties.remove();
  };
};

var app = angular.module('socially');
// By naming our file with .ng.js meteor-angular will take care of the minification
// process, simillar to ng-annotate so we don't have to use strings for our vars
// app.controller('PartiesListCtrl', ['$scope', PartiesListCtrl]);
app.controller('PartiesListCtrl', PartiesListCtrl);
