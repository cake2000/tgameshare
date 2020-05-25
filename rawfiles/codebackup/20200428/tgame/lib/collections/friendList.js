import { Mongo } from 'meteor/mongo';

const FriendList = new Mongo.Collection('FriendList');

Meteor.startup(() => {
  if (Meteor.isServer) {
    FriendList._ensureIndex({ userId1: 1, userId2: 1 });
  }
  export default FriendList;
});

