import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const AutoRunMatchList = new Mongo.Collection('AutoRunMatchList');

const Schema = {};

Schema.AutoRunMatchList = new SimpleSchema({
  createdAt: {
    type: Date
  },
  runnerId: {
    type: String, optional: true
  },
  runStartedAt: {
    type: Date, optional: true
  },
  runCompletedAt: {
    type: Date, optional: true
  },
  level: {
    type: String // Advanced or Beginner
  },
  tournamentId: {
    type: String
  },
  sectionId: {
    type: String, optional: true
  },
  roundId: {
    type: String, optional: true
  },
  pairIndex: {
    type: Number, optional: true
  },
  team0Users: {
    type: Array,
    label: 'this is the list of users registered for this tournament'
  },
  'team0Users.$': {
    type: Object
  },
  'team0Users.$.userId': {
    type: String
  },
  'team0Users.$.username': {
    type: String
  },
  'team0Users.$.aiVersion': {
    type: String
  },
  team1Users: {
    type: Array,
    label: 'this is the list of users registered for this tournament'
  },
  'team1Users.$': {
    type: Object
  },
  'team1Users.$.userId': {
    type: String
  },
  'team1Users.$.username': {
    type: String
  },
  'team1Users.$.aiVersion': {
    type: String
  },
  status: {
    type: String
  },
  activeGameListId: {
    type: String, optional: true
  },
  winnerId: {
    type: String, optional: true
  }
});

AutoRunMatchList.attachSchema(Schema.AutoRunMatchList);

export default AutoRunMatchList;
