import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const TournamentRound = new Mongo.Collection('TournamentRound');

const Schema = {};

Schema.TournamentRound = new SimpleSchema({
  sectionId: {
    type: String
  },
  tournamentId: {
    type: String
  },
  round: {
    type: Number
  },
  numberOfPairs: {
    type: Number
  },
  numberOfFinishPairs: {
    type: Number
  },
  pairs: {
    type: Array
  },
  'pairs.$': {
    type: Object
  },
  'pairs.$.id': {
    type: Number
  },
  'pairs.$.players': {
    type: Array
  },
  'pairs.$.players.$': {
    type: Object
  },
  'pairs.$.players.$.playerId': {
    type: String,
    optional: true
  },
  'pairs.$.players.$.point': {
    type: Number,
    optional: true,
  },
  'pairs.$.players.$.cancelTournament': {
    type: Boolean,
    optional: true,
  },
  'pairs.$.activeGameListId': {
    type: String,
    optional: true
  },
  'pairs.$.gameRoomId': {
    type: String,
    optional: true
  },
  'pairs.$.status': {
    type: String
  },
  level: {
    type: String,
    optional: true
  }
});

TournamentRound.attachSchema(Schema.TournamentRound);

Meteor.startup(() => {
  if (Meteor.isServer) {
    TournamentRound._ensureIndex({ sectionId: 1 });
  }
  export default TournamentRound;
});
