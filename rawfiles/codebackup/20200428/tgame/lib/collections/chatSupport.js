import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const ChatSupport = new Mongo.Collection('ChatSupport');
const Schema = {};

Schema.ChatSupport = new SimpleSchema({
  userId: {
    type: String
  },
  unReadCount: {
    type: Number,
    defaultValue: 0,
  },
  unReadClientCount: {
    type: Number,
    defaultValue: 0,
  },
  createdAt: {
    type: Date,
  },
  lastTimeAdded: {
    type: Date,
  }
});

ChatSupport.attachSchema(Schema.ChatSupport);
Meteor.startup(() => {
  if (Meteor.isServer) {
    ChatSupport._ensureIndex({ userId: 1 });
  }
  export default ChatSupport;
});

