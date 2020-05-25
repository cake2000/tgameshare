import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const GamesRelease = new Mongo.Collection('gamesRelease');
const Schema = {};

Schema.GamesRelease = new SimpleSchema({
  gameId: {
    type: String
  },
  createdAt: {
    type: Date
  },
  name: {
    type: String
  }
});

GamesRelease.attachSchema(Schema.GamesRelease);
Meteor.startup(() => {
  if (Meteor.isServer) {
    GamesRelease._ensureIndex({ gameId: 1 });
  }
  export default GamesRelease;
});

