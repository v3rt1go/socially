/* global Mongo */
// Code here runs on both client and server
// if we don't use var on the Parties, it will define it outside the scope of this file
// making this collection available for both client and server code in different files
Parties = new Mongo.Collection('parties');

Parties.allow({
  insert: function(userId, party) {
    return userId && party.owner == userId;
  },
  update: function(userId, party, fields, modifier) {
    return userId && party.owner == userId;
  },
  remove: function(userId, party) {
    return userId && party.owner == userId;
  }
});

// Meteor methods are a way to perform more complex logic then the allow method does.
// The Meteor methods are responsible for checking permissions, just like the allow method does.
Meteor.methods({
  invite: function(partyId, userId) {
    // check is part of the meteor api
    // The check package includes pattern checking functions useful for checking
    // the types and structure of variables and an extensible library of patterns
    // to specify which types you are expecting.
    check(partyId, String);
    check(userId, String);

    if (!this.userId) {
      throw new Meteor.Error(403, 'You must be logged in to invite!');
    }

    var party = Parties.findOne(partyId);
    if (!party)
      throw new Meteor.Error(404, 'No such party found');
    if (party.owner !== this.userId)
      throw new Meteor.Error(404, 'No such party found');
    if (party.public)
      throw new Meteor.Error(400, 'The party is public. No need for invites');

    if (userId !== party.owner && !_.contains(party.invited, userId)) {
      Parties.update(partyId, { $addToSet: { invited: userId } });

      var from = contactEmail(Meteor.users.findOne(this.userId));
      var to = contactEmail(Meteor.users.findOne(userId));

      if (Meteor.isServer && to) {
        // This code only runs on the server. If you didn't want clients
        // to be able to see it, you could move it to a separate file.
        // This is the Email function that sends email to the invited client. This
        // function can't be called from the client side so we have to put it
        // inside an isServer statement. It's added with 'meteor add email'
        Email.send({
          from: 'noreply@socially.com',
          to: to,
          replyTo: from || undefined,
          subject: 'PARTY: ' + party.name,
          text:
          'Hey, I just invited you to ' + party.name + ' on Socially.' +
          '\n\nCome check it out: ' + Meteor.absoluteUrl() + '\n'
        });
      }
    }
  },
  rsvp: function (partyId, rsvp) {
    check(partyId, String);
    check(rsvp, String);

    if (!this.userId)
      throw new Meteor.Error(403, "You must be logged in to RSVP!");
    if (! _.contains(['yes', 'no', 'maybe'], rsvp))
      throw new Meteor.Error(400, "Invalid RSVP");

    var party = Parties.findOne(partyId);
    if (!party)
      throw new Meteor.Error(404, 'No such party found');
    if (! party.public && party.owner !== this.userId &&
      !_.contains(party.invited, this.userId))
      // private, but let's not tell this to the user
      throw new Meteor.Error(403, "No such party");

    var rsvpIndex = _.indexOf(_.pluck(party.rsvps, 'user'), this.userId);
    if (rsvpIndex !== -1) {
      // update existing rsvp entry

      if (Meteor.isServer) {
        // update the appropriate rsvp entry with $
        Parties.update(
          {_id: partyId, "rsvps.user": this.userId},
          {$set: {"rsvps.$.rsvp": rsvp}});
      } else {
        // minimongo doesn't yet support $ in modifier. as a temporary
        // workaround, make a modifier that uses an index. this is
        // safe on the client since there's only one thread.
        var modifier = {$set: {}};
        modifier.$set["rsvps." + rsvpIndex + ".rsvp"] = rsvp;
        Parties.update(partyId, modifier);
      }
      // Possible improvement: send email to the other people that are
      // coming to the party.
    } else {
      // add new rsvp entry
      Parties.update(partyId,
        {$push: {rsvps: {user: this.userId, rsvp: rsvp}}});
    }
  }
});

var contactEmail = function (user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;
  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;
  return null;
};
