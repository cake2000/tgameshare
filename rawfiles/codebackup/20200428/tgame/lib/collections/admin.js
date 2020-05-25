import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Admin = new Mongo.Collection('admin');

const Schema = {};

Schema.Admin = new SimpleSchema({
  type: {
    type: String,
  },
  data: {
    type: Object,
    blackbox: true
  }
});
Admin.attachSchema(Schema.Admin);
Meteor.startup(() => {
  if (Meteor.isServer) {
    Admin._ensureIndex({ type: 1 });
  }
  export default Admin;
});

