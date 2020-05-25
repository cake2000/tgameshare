import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const UserVisitHistory = new Mongo.Collection('UserVisitHistory');

const Schema = {};

Schema.UserVisitHistory = new SimpleSchema({
  userId: {
    type: String
  },
  userInPageHistory: {
    type: Array,
    optional: true,
    defaultValue: [],
  },
  'userInPageHistory.$': {
    type: Object,
  },
  'userInPageHistory.$.page': {
    type: String,
  },
  'userInPageHistory.$.timestamp': {
    type: Date,
  },
  'userInPageHistory.$.duration': {
    type: Number, // as seconds
  },
});

UserVisitHistory.attachSchema(Schema.UserVisitHistory);

export default UserVisitHistory;
