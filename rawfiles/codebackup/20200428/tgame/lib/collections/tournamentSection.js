import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const TournamentSection = new Mongo.Collection('TournamentSection');

const Schema = {};

Schema.TournamentSection = new SimpleSchema({
  createdAt: {
    type: Date
  },
  tournamentId: {
    type: String
  },
  type: {
    type: String
  },
  name: {
    type: String,
    optional: true
  },
  numberOfRounds: {
    type: Number,
    label: 'different sections may have different number of rounds so it is an attribute of the section'
  },
  playerRatingLowerBound: {
    type: Number,
    optional: true,
    label: 'Rating lower/upper bound: limits on user rating. When there is no limit just use -1 to 10000, since rating is never higher than 10000'
  },
  playerRatingUpperBound: {
    type: Number,
    optional: true,
    label: 'Rating lower/upper bound: limits on user rating. When there is no limit just use -1 to 10000, since rating is never higher than 10000'
  },
  playerGradeLowerBound: {
    type: Number,
    optional: true,
    label: 'limits on user grade (from 1 to 12) when registering, and when not using just use -1.'
  },
  playerGradeUpperBound: {
    type: Number,
    optional: true,
    label: 'limits on user grade (from 1 to 12) when registering, and when not using just use -1.'
  },
  registeredUserIds: {
    type: Array,
    label: 'this is the list of users registered for this tournament'
  },
  'registeredUserIds.$': {
    type: Object
  },
  'registeredUserIds.$.userId': {
    type: String
  },
  'registeredUserIds.$.registerTime': {
    type: Date
  },
  'registeredUserIds.$.isAllBYE': {
    type: Boolean,
    optional: true
  },
  'registeredUserIds.$.hasBYE': {
    type: Boolean
  },
  'registeredUserIds.$.isBYE': {
    type: Boolean
  },
  'registeredUserIds.$.rating': {
    type: Number
  },
  'registeredUserIds.$.isFirstMove': {
    type: Boolean
  },
  'registeredUserIds.$.firstMoveCount': {
    type: Number
  },
  'registeredUserIds.$.prevOpponentTeamsInThisTournament': {
    type: String,
    optional: true
  },
  'registeredUserIds.$.point': {
    type: Number,
    label: 'this is the total point of users registered for this tournament',
    optional: true,
    defaultValue: 0,
  },
  'registeredUserIds.$.adjPoint': {
    type: Number,
    label: 'this is the adjusted points of users as point + tie breaking points',
    optional: true,
    defaultValue: 0,
  },
  'registeredUserIds.$.robotRelease': {
    type: String,
    optional: true
  },
  currentRound: {
    type: Number
  },
  status: {
    type: String
  },
  reward: {
    type: Array
  },
  'reward.$': {
    type: Object
  },
  'reward.$.top': {
    type: Number
  },
  'reward.$.type': {
    type: String
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date,
    optional: true
  },
  announcement: {
    type: Array,
  },
  'announcement.$': {
    type: Object,
  },
  'announcement.$.msg': {
    type: String,
  },
  'announcement.$.createdAt': {
    type: Date,
  },
});

TournamentSection.attachSchema(Schema.TournamentSection);

Meteor.startup(() => {
  if (Meteor.isServer) {
    TournamentSection._ensureIndex({ tournamentId: 1 });
  }
  export default TournamentSection;
});
