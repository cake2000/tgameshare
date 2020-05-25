import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Classes = new Mongo.Collection('classes');
const Schema = {};

Schema.Classes = new SimpleSchema({
  class_id: {
    type: String
  },
  category_name: {
    type: String,
    optional: true,
    defaultValue: ''
  },
  classForumCategoryID: { // numeric id for class forum (category)
    type: String,
    optional: true
  },
  userGroupID: { // numeric id for user group for this class
    type: String,
    optional: true
  },
  user_group_name: {
    type: String,
    optional: true,
    defaultValue: ''
  },
  name: {
    type: String,
  },
  numbOfStudents: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  createdTime: {
    type: Date,
    optional: true,
    defaultValue: new Date(),
  },
  syncMode: {
    type: String, optional: true, defaultValue: "Free"
  },
  isScreenLocked: {
    type: Boolean, optional: true, defaultValue: false
  },  
  showSolutionButton: {
    type: Boolean,
    defaultValue: true
  },
  showFastForwardButton: {
    type: Boolean,
    defaultValue: false
  },
  game: {
    type: String,
    optional: true,
  },
  users: {
    optional: true,
    type: Array,
    defaultValue: []
  },
  'users.$': {
    type: String,
    optional: true
  },
  owner: {
    type: String
  }
});

Classes.attachSchema(Schema.Classes);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Classes._ensureIndex({ name: 1 });
  }
  export default Classes;
});
