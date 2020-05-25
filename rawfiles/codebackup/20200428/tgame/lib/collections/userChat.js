import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const UserChat = new Mongo.Collection('UserChat');
const Schema = {};

Schema.UserChat = new SimpleSchema({
  userId: {
    type: String
  },
  scenarioId: {
    type: String,
  },
  testFailureCurrentElementCount: {
    type: Number,
    defaultValue: 0
  },
  firstHintsDisplayed: { // string of all elementIds for which we have displayed list of first hints
    type: String,
    defaultValue: ''
  },
  lastHintDisplayTime: {
    type: Number,
    defaultValue: 0
  },
  subDislayList: {
    type: String,
    defaultValue: ''
  },
  chats: { // array of chats
    type: Array,
    defaultValue: []
  },
  'chats.$': {
    type: Object
  },
  'chats.$.createdAt': {
    type: Date
  },
  'chats.$.actionType': { // USER_TEXT, USER_TEST_RESULT, BOT_TEXT, SUPPORT_TEXT, SCENARIO_ELEMENT
    type: String,
    optional: true
  },
  'chats.$.actionContent': {
    type: String,
    optional: true
  },
  'chats.$.elementType': { // copied from elements in scenario
    type: String,
    optional: true
  },
  'chats.$.condition': {
    type: String,
    optional: true
  },
  'chats.$.conditionInd': {
    type: String,
    optional: true
  },
  'chats.$.conditionDone': {
    type: Boolean,
    optional: true
  },
  'chats.$.sender': {
    type: String,
    optional: true
  }
});

UserChat.attachSchema(Schema.UserChat);
Meteor.startup(() => {
  if (Meteor.isServer) {
    UserChat._ensureIndex({ userId: 1, scenarioId: 1 });
  }
  export default UserChat;
});
