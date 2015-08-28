// This function defines what to publish from the server to the client
Meteor.publish('parties', function() {
  'use strict';

  return Parties.find({
    $or: [{
      $and: [
        {'public': true},
        {'public': {$exists: true}}
      ]
    }, {
      $and: [
        {owner: this.userId}, // we have access to the current user
        {owner: {$exists: true}}
      ]
    }]
  });
});
