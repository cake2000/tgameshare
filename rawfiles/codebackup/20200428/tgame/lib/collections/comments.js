import { Mongo } from 'meteor/mongo';

const Comments = new Mongo.Collection('comments');

Meteor.startup(() => {
  if (Meteor.isServer) {
    Comments._ensureIndex({ postId: 1 });
  }
});

export default Comments;
