import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Schools = new Mongo.Collection('schools');

const Schema = {};

Schema.Schools = new SimpleSchema({
  SchoolName: String,
  IsPublic: Boolean
});

Schools.allow({
  insert() { return true; }
});

Schools.attachSchema(Schema.Schools);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Schools._ensureIndex({ SchoolName: 1 });
  }
});

export default Schools;
