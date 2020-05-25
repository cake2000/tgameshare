import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const UserRobotCodeByLesson = new Mongo.Collection('UserRobotCodeByLesson');

const Schema = {};

Schema.UserRobotCodeByLesson = new SimpleSchema({
  UserID: {
    type: String
  },
  gameId: {
    type: String
  },
  ScenarioID: {
    type: String
  },
  lastUpdateTime: {
    type: Number,
    optional: true,
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

UserRobotCodeByLesson.attachSchema(Schema.UserRobotCodeByLesson);

Meteor.startup(() => {
  if (Meteor.isServer) {
    UserRobotCodeByLesson._ensureIndex({ UserID: 1, gameId: 1, ScenarioID: 1 });
  }
  export default UserRobotCodeByLesson;
});
