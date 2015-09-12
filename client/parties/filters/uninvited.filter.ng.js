// Filter to display only users that can be invited to a party
(function() {
  'use strict';

  angular.module('socially').filter('uninvited', [function() {
    return function(users, party) {
      if (!party) {
        return false;
      }

      return _.filter(users, function(user) {
        if (user._id === party.owner ||
          _.contains(party.invited, user.id)) {
          return false;
        } else {
          return true;
        }
      });
    };
  }]);
}());
