import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Evaluation = new Mongo.Collection('evaluation');

const Schema = {};

Schema.Evaluation = new SimpleSchema({
  language: {
    type: String
  },
  elementId: {
    type: String
  },
  skill: {
    type: String
  },
  elementType: {
    type: String
  },
  answerKey: {
    type: String
  },
  answerReason: {
    type: String,
    optional: true
  },
  header: {
    type: String
  },
  html: {
    type: String
  },
  answers: {
    type: Array
  },
  'answers.$': {
    type: String
  }
});

Evaluation.attachSchema(Schema.Evaluation);

export default Evaluation;
