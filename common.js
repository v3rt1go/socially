/* globals Mongo */
// Code here runs on both client and server
// if we don't use var on the Parties, it will define it outside the scope of this file
// making this collection available for both client and server code in different files
Parties = new Mongo.Collection('parties');
