/* globals Meteor, Parties */
// Here we can control the startup behavior for meteor
Meteor.startup(function() {
  'use strict';

  // Seed some test parties on app start, if non exist
  if (Parties.find().count() === 0) {
    var parties = [
      {'name': 'Dubstep-Free Zone',
        'description': 'Fast just got faster with Nexus S.'},
      {'name': 'All dubstep all the time',
        'description': 'Get it on!'},
      {'name': 'Savage lounging',
        'description': 'Leisure suit required. And only fiercest manners.'}
    ];
    for (var i = 0; i < parties.length; i++) {
      Parties.insert(parties[i]);
    }
  }
});
