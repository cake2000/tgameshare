/* global Roles */

import SimpleSchema from 'simpl-schema';

const UserTest = new Mongo.Collection('UserTest');
const Schema = {};

Schema.UserTest = new SimpleSchema({
  userId: {
    type: String
  },
  gameId: {
    type: String,
  },
  testSeq: {
    type: Number,
  },
  testResult: {
    type: String, optional: true
  },
  testName: {
    type: String, optional: true
  },
  script: {
    type: String,
  },
  asOfTime: {
    type: Date
  }
});

UserTest.attachSchema(Schema.UserTest);
Meteor.startup(() => {
  export default UserTest;
});
