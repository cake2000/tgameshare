import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { LEVELS, OPPONENTS, MULTIPLAYER_MODE } from '../enum';

const Games = new Mongo.Collection('games');
const Schema = {};

Games.helpers({
  gameTitle() {
    return this.title;
  }
});

Schema.Games = new SimpleSchema({
  title: {
    type: String
  },
  name: {
    type: String
  },
  trackName: {
    type: String
  },
  seq: {
    type: Number, optional: true
  },
  imageUrl: {
    type: String
  },
  description: {
    type: String
  },
  teamSize: {
    type: Number
  },
  teamNumber: {
    type: Number
  },
  level: {
    type: Array
  },
  'level.$': {
    type: Object
  },
  'level.$.name': {
    type: String,
    allowedValues: [LEVELS.BEGINNER, LEVELS.ADVANCED]
  },
  'level.$.imageUrl': {
    type: String
  },
  multiplayerMode: {
    type: Array,
    optional: true,
    defaultValue: [],
  },
  'multiplayerMode.$': {
    type: String,
    allowedValues: [MULTIPLAYER_MODE.MODE1VS1, MULTIPLAYER_MODE.MODE2VS2, MULTIPLAYER_MODE.MODE3VS3]
  },
  opponent: {
    type: Array
  },
  'opponent.$': {
    type: Object
  },
  'opponent.$.title': {
    type: String
  },
  'opponent.$.name': {
    type: String,
    allowedValues: [OPPONENTS.MYSELF.name, OPPONENTS.PLAYERNETWORK.name, OPPONENTS.TOURNAMENT.name]
  },
  'opponent.$.imageUrl': {
    type: String
  },
  'opponent.$.link': {
    type: String
  }
});

Games.attachSchema(Schema.Games);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Games._ensureIndex({ name: 1 });
  }
  export default Games;
});
