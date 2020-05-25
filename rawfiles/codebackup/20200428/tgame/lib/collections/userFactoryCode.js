/* global Roles */

import SimpleSchema from 'simpl-schema';

const UserFactoryCode = new Mongo.Collection('UserFactoryCode');
const Schema = {};

// only one copy of code per user per gameId
Schema.UserFactoryCode = new SimpleSchema({
  userId: {
    type: String
  },
  gameId: {
    type: String,
  },
  code: {
    type: String,
  },
  asOfTime: {
    type: Date
  },
  currentFactoryTestSeq: {
    type: Number, defaultValue: 0
  }
});

UserFactoryCode.attachSchema(Schema.UserFactoryCode);
Meteor.startup(() => {
  export default UserFactoryCode;
});
