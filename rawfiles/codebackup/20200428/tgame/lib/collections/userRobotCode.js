import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const UserRobotCode = new Mongo.Collection('UserRobotCode');

const Schema = {};

Schema.UserRobotCode = new SimpleSchema({
  UserID: {
    type: String
  },
  gameId: {
    type: String
  },
  CodeUpdates: {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'CodeUpdates.$': {
    type: Object
  },
  'CodeUpdates.$.time': {
    type: String,
    optional: true
  },
  'CodeUpdates.$.label': {
    type: String,
    optional: true
  },
  'CodeUpdates.$.chg': {
    type: String,
    optional: true
  }
});

UserRobotCode.attachSchema(Schema.UserRobotCode);

Meteor.startup(() => {
  if (Meteor.isServer) {
    UserRobotCode._ensureIndex({ UserID: 1, gameId: 1 });
  }
  export default UserRobotCode;
});
