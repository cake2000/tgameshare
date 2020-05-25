import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { NotificationsSchema } from './notifications';

Meteor.startup(() => {
  const InvitationLogs = new Mongo.Collection('InvitationLogs');
  const Schema = {};
  Schema.InvitationLogs = NotificationsSchema;
  InvitationLogs.attachSchema(Schema.InvitationLogs);

  if (Meteor.isServer) {
    InvitationLogs._ensureIndex({ 'sender.userId': 1 });
  }
  export default InvitationLogs;
});