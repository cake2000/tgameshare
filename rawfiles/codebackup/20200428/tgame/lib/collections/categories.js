import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Categories = new Mongo.Collection('categories');
const Schema = {};

Schema.Categories = new SimpleSchema({
  classId: {
    type: String
  },
  userGroupID: {
    type: String
  }
});

Categories.attachSchema(Schema.Categories);

Meteor.startup(() => {
  if (Meteor.isServer) {
  }
  export default Categories;
});
