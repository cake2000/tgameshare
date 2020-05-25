import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const Languages = new Mongo.Collection('Languages');

const Schema = {};

Schema.Languages = new SimpleSchema({
  languageName: {
    type: String
  },
  skill: {
    type: String
  },
  instructionElements: { // array of elements
    type: Array,
    defaultValue: []
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
  'instructionElements.$.answerKey': {
    type: String,
    optional: true
  },
  'instructionElements.$.answerReason': {
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
  'instructionElements.$.skill': {
    type: String,
    optional: true
  },
});

Languages.attachSchema(Schema.Languages);

export default Languages;
