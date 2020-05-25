import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const UserCodeTesting = new Mongo.Collection('UserCodeTesting');

const Schema = {};

Schema.UserCodeTesting = new SimpleSchema({
  UserID: {
    type: String
  },
  gameId: {
    type: String
  },
  SubTrackName: {
    type: String
  },
  ScenarioID: {
    type: String
  },
  CodeUpdates: {
    type: Array
  },
  'CodeUpdates.$': {
    type: Object
  },
  'CodeUpdates.$.time': {
    type: String
  },
  'CodeUpdates.$.label': {
    type: String
  },
  'CodeUpdates.$.chg': {
    type: String
  },
});

// UserCodeTesting.attachSchema(Schema.UserCodeTesting);

Meteor.startup(() => {
  if (Meteor.isServer) {
    UserCodeTesting._ensureIndex({ UserID: 1, ScenarioID: 1 });
  }
  export default UserCodeTesting;
});
