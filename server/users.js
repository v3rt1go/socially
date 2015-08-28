// We don't need to create a Users common model, like we did for Parties
// This is handled already by meteor-accounts packages
Meteor.publish('users', function() {
  'use strict';
  // On this publication we return only emails and profiles of the users
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});
