import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const Scenarios = new Mongo.Collection('Scenarios');

const Schema = {};

Schema.Scenarios = new SimpleSchema({
  // prevId: {
  //   type: String // ID of previous scenario
  // },
  userId: { // owner of scenario, by default it is "system"
    type: String
  },
  visibleUserIds: { // whoelse can see this except for owner, most likely this is student
    type: Array,
    defaultValue: [],
    optional: true,
  },
  'visibleUserIds.$': {
    type: Object,
  },
  package: { // 'starter' or 'advanced' or 'pro' or ''
    type: String
  },
  ScenarioName: {
    type: String
  },
  ScenarioSequenceNumber: { // sequence in the package
    type: Number
  },
  coins: {
    type: Number, optional: true
  },
  concepts: {
    type: String,
    optional: false, 
    defaultValue: ""
  },
  studyTime: {
    type: String,
    optional: true, 
    defaultValue: ""
  },
  SetupScript: {
    type: String
  },
  Difficulty: { // 1 to 5
    type: Number
  },
  locked: {
    type: Boolean,
    optional: true,
  },
  gameId: {
    type: String
  },
  gameName: {
    type: String
  },
  hideReleaseButton: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  applyBaselineCode: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  baselineCode: {
    type: String,
    optional: true,
    defaultValue: ""
  },
  readonlyLinenumbers: {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'readonlyLinenumbers.$': {
    type: Number
  },
  instructionElements: { // array of elements
    type: Array,
    // defaultValue: []
  },
  'instructionElements.$': {
    type: Object
  },
  'instructionElements.$.elementId': {
    type: String
  },
  'instructionElements.$.elementType': {
    type: String
  },
  'instructionElements.$.html': {
    type: String,
    optional: true
  },
  // 'instructionElements.$.codeType': {
  //   type: String,
  //   optional: true
  // },
  'instructionElements.$.answerKey': {
    type: String,
    optional: true
  },
  'instructionElements.$.answerReason': {
    type: String,
    optional: true
  },
  'instructionElements.$.code': {
    type: String,
    optional: true
  },
  'instructionElements.$.cleancode': {
    type: String,
    optional: true
  },
  'instructionElements.$.codeHidden': {
    type: Boolean,
    optional: true
  },
  // 'instructionElements.$.hints': {
  //   type: 'serialize',
  //   optional: true
  // },
  'instructionElements.$.condition': {
    type: String,
    optional: true
  },
  'instructionElements.$.conditionInd': {
    type: String,
    optional: true
  },
  'instructionElements.$.conditionDone': {
    type: String,
    optional: true
  },
  group: {
    type: String,
    optional: true
  },
  'instructionElements.$.optional': {
    type: String,
    optional: true
  },
  'instructionElements.$.showCondition': {
    type: String,
    optional: true
  },
  'instructionElements.$.languageSkills': {
    type: String,
    optional: true
  },
  // 'instructionElements.$.condition': {
  //   type: Array,
  //   defaultValue: []
  // },
  // 'instructionElements.$.conditions.$': {
  //   type: String
  // }
});

Scenarios.attachSchema(Schema.Scenarios);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Scenarios._ensureIndex({ gameId: 1 });
  }
  export default Scenarios;
});
