import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Message = new Mongo.Collection('mesasge');

const Schema = {};

Schema.Message = new SimpleSchema({
  chatSupportId: {
    type: String,
  },
  message: {
    type: String,
  },
  actionType: {
    type: String,
  },
  isSeen: {
    type: Boolean,
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
  }
});
Message.attachSchema(Schema.Message);
Meteor.startup(() => {
  if (Meteor.isServer) {
    Message._ensureIndex({ chatSupportId: 1 });
  }
  export default Message;
});
