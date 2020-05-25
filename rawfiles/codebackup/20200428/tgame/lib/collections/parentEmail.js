import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const ParentEmail = new Mongo.Collection('parent-email');

const Schema = {};

Schema.ParentEmail = new SimpleSchema({
  email: {
    type: String,
  },
  key: {
    type: String,
  },
  dateOfBirth: String,
  inviteRoomId: {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    defaultValue: new Date(),
  }
});
ParentEmail.attachSchema(Schema.ParentEmail);
Meteor.startup(() => {
  if (Meteor.isServer) {
    ParentEmail._ensureIndex({ email: 1 });
  }
  export default ParentEmail;
});
