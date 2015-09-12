// This function defines what to publish from the server to the client
// We pass pagination and sorting params in options
Meteor.publish('parties', function(options, searchTerm) {
  'use strict';

  if (searchTerm == null) {
    searchTerm = '';
  }

  // Counts is provided by the tmeasday:publish-counts meteor package
  // and is used to return in real time the count of a publication from a
  // coursor - not the full record set. We're using this to get the count
  // of items for client pagination. This is required because we are doing
  // pagination on both server and client. The server publication is sending
  // to subscribed clients only the cursor for the paginated record set, not
  // the full record set coursor, so we have to add a way to count the full
  // server coursor - with sort options added ofc.
  Counts.publish(this, 'numberOfParties', Parties.find({
    'name': {
      '$regex': '.*' + searchTerm + '.*',
      '$options': 'i'
    },
    $or:[
      {$and:[
        {'public': true},
        {'public': {$exists: true}}
      ]},
      {$and:[
        {owner: this.userId},
        {owner: {$exists: true}}
      ]},
      {$and:[
        {invited: this.userId},
        {invited: {$exists: true}}
      ]}
      // noReady: true means that the publication will be available to subscribed
      // client only when the full count has completed - see readiness on publish-counts
      // package documentation
    ]}), { noReady: true });

  return Parties.find({
    'name': {
      '$regex': '.*' + searchTerm + '.*',
      '$options': 'i'
    },
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
    },
    {$and:[
      {invited: this.userId},
      {invited: {$exists: true}}
    ]}]
  }, options);
});
