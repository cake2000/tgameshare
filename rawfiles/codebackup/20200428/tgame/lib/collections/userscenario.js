import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const UserScenarios = new Mongo.Collection('UserScenarios');

const Schema = {};

Schema.UserScenarios = new SimpleSchema({
  userId: { // owner of scenario, by default it is "system"
    type: String
  },
  ScenarioSequenceNumber: { // sequence in the package
    type: Number
  },
  ScenarioName: {
    type: String
  },
  gameId: {
    type: String
  },
});

UserScenarios.attachSchema(Schema.UserScenarios);

Meteor.startup(() => {
  if (Meteor.isServer) {
    UserScenarios._ensureIndex({ userId: 1, ScenarioSequenceNumber: 1 });
  }
  export default UserScenarios;
});
