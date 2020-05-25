/* global Roles */

import SimpleSchema from 'simpl-schema';
import { USER_TYPES } from '../enum';
import Persons from './persons';

const UserLesson = new Mongo.Collection('UserLesson');
const Schema = {};

Schema.UserLesson = new SimpleSchema({
  userId: {
    type: String
  },
  lessonId: {
    type: String,
  },
  currentSlideId: {
    type: String,
    optional: true
  },
  currentSlideInd: { // only used when being synced by teacher in sync mode
    type: Number,
    optional: true
  },
  currentFragmentInd: { // only used when being synced by teacher in sync mode
    type: Number,
    optional: true
  },
  currentSpeech: { // only used when being synced by teacher in sync mode
    type: String,
    optional: true
  },
  slideVisitLog: { // everything the user has done with that slide, such as all input and code 
    type: Array,
    optional: true
  },
  'slideVisitLog.$': {
    type: Object
  },
  'slideVisitLog.$.slideId': {
    type: String
  },
  'slideVisitLog.$.slideType': {
    type: String
  },  
  'slideVisitLog.$.slideNode': {
    type: String
  },  
  'slideVisitLog.$.autoTrigger': { // auto loaded or triggered by user clicking next or jump
    type: Boolean, optional: true
  },  
  'slideVisitLog.$.skipped': {
    type: Boolean, optional: true
  },
  'slideVisitLog.$.input': {
    type: String, optional: true
  },
  'slideVisitLog.$.answer': {
    type: String, optional: true
  },
  'slideVisitLog.$.choice': {
    type: String, optional: true
  },
  'slideVisitLog.$.userRobotCode': {
    type: String, optional: true
  },
  'slideVisitLog.$.robotCodeInd': {
    type: Number, optional: true
  },
  'slideVisitLog.$.userTestScript': {
    type: String, optional: true
  },
  'slideVisitLog.$.testScriptInd': {
    type: Number, optional: true
  },
  'slideVisitLog.$.completed': {
    type: String, optional: true
  },
  'slideVisitLog.$.openTime': {
    type: Date, optional: true
  },
  'slideVisitLog.$.completedTime': {
    type: Date, optional: true
  }, 
  'slideVisitLog.$.attempt': {
    type: Array, optional: true, defaultValue: []
  },   
  'slideVisitLog.$.attempt.$': {
    type: Object
  },   
  'slideVisitLog.$.attempt.$.time': {
    type: Date, optional: true
  },   
  'slideVisitLog.$.attempt.$.result': {
    type: String, optional: true
  },   
  'slideVisitLog.$.attempt.$.code': {
    type: String, optional: true
  },     
  'slideVisitLog.$.projectId': {
    type: String, optional: true
  },  
  coinsPaid: {
    type: Boolean,
    optional: true
  },
  unlocked: {
    type: Boolean,
    optional: true
  },
});

// UserLesson.allow({
//   update: function (userId, doc, fields, modifier) {
//     debugger;
//     return true;
//   }
// });

UserLesson.attachSchema(Schema.UserLesson);
Meteor.startup(() => {
  export default UserLesson;
});
