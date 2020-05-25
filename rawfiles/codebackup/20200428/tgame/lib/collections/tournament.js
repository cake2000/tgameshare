import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Tournament = new Mongo.Collection('Tournament');

const Schema = {};

Schema.Tournament = new SimpleSchema({
  createdAt: {
    type: Date
  },
  Name: {
    type: String
  },
  RegistrationFee: {
    type: Number
  },
  gameId: {
    type: String
  },
  isOpen: {
    type: Boolean,
    optional: true,
  },
  isAIOnly: {
    type: Boolean
  },
  isHumanOnly: {
    type: Boolean
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date,
    optional: true
  },
  organizedBy: {
    type: String
  },
  description: {
    type: String,
    optional: true,
  },
  status: {
    type: String
  }
});

Tournament.attachSchema(Schema.Tournament);
Meteor.startup(() => {
  if (Meteor.isServer) {
    Tournament._ensureIndex({ gameId: 1 });
  }
  export default Tournament;
});
