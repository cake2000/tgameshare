import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { OPPONENTS, SLOT_OPTION } from '../enum';

const GameRoom = new Mongo.Collection('gameRoom');
const Schema = {};

Schema.GameRoom = new SimpleSchema({
  owner: {
    type: String
  },
  createdAt: {
    type: Date
  },
  gameId: {
    type: String
  },
  level: {
    type: String,
  },
  mode: {
    type: String,
    allowedValues: [OPPONENTS.MYSELF.name, OPPONENTS.PLAYERNETWORK.name, OPPONENTS.TOURNAMENT.name]
  },
  playerInfo: {
    type: Array,
  },
  'playerInfo.$': {
    type: Object
  },
  'playerInfo.$.slot': {
    type: Number,
    optional: true,
  },
  'playerInfo.$.invitedBy': {
    type: String,
    optional: true,
  },
  'playerInfo.$.teamID': {
    type: String,
    optional: true
  },
  'playerInfo.$.playerType': {
    type: String
  },
  'playerInfo.$.ready': {
    type: Boolean
  },
  'playerInfo.$.userId': {
    type: String,
    optional: true
  },
  'playerInfo.$.slotOption': {
    type: String,
    optional: true,
    defaultValue: null,
    allowedValues: [SLOT_OPTION.NETWORK_PLAYER, SLOT_OPTION.ROBOT, null]
  },
  'playerInfo.$.playerID': {
    type: String,
    optional: true
  },
  'playerInfo.$.username': {
    type: String,
    optional: true
  },
  'playerInfo.$.defaultItems': {
    type: Array,
    optional: true,
    defaultValue: [],
  },
  'playerInfo.$.defaultItems.$': String,
  'playerInfo.$.cancelTournamentGame': {
    type: Boolean,
    optional: true
  },
  'playerInfo.$.playerAvatarURL': {
    type: String,
    label: 'Avatar URL',
    optional: true
  },
  'playerInfo.$.playerCoins': {
    type: Number,
    label: 'Gold coins',
    optional: true
  },
  'playerInfo.$.aiVersion': {
    type: String,
    optional: true
  },
  'playerInfo.$.aiList': {
    type: Array,
    label: 'List of AI created by player for this game',
    optional: true,
  },
  'playerInfo.$.aiList.$': {
    type: Object,
    label: 'AI record',
    blackbox: true,
  },
  'playerInfo.$.inRoom': {
    type: Boolean,
    optional: true
  },
  inRoom: {
    type: String,
    optional: true
  },
  isTournament: {
    type: Boolean,
    optional: true
  },
  chatLogs: {
    type: Array,
    optional: true
  },
  'chatLogs.$': {
    type: Object,
    optional: true
  },
  'chatLogs.$.sender': {
    type: String,
    optional: true
  },
  'chatLogs.$.message': {
    type: String,
    optional: true
  },
  'chatLogs.$.owner': {
    type: String,
    optional: true
  },
  playerIsTyping: {
    type: Array,
    optional: true
  },
  'playerIsTyping.$': {
    type: String,
    optional: true
  },
});

GameRoom.attachSchema(Schema.GameRoom);
Meteor.startup(() => {
  if (Meteor.isServer) {
    GameRoom._ensureIndex({ owner: 1 });
  }
  export default GameRoom;
});

