import { Mongo } from 'meteor/mongo';

const FriendWaitingList = new Mongo.Collection('FriendWaitingList');

Meteor.startup(() => {
  if (Meteor.isServer) {
    FriendWaitingList._ensureIndex({ userId1: 1, userId2: 1 });
  }
  export default FriendWaitingList;
});

