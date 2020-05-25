import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { NOTIFICATION } from '../enum';

const Notifications = new Mongo.Collection('notifications');

const Schema = {};

export const NotificationsSchema = new SimpleSchema({
  _id: {
    type: String
  },
  game: {
    type: Object,
    optional: true
  },
  'game.name': {
    type: String
  },
  'game.id': {
    type: String
  },
  gameLevel: {
    type: String,
    optional: true
  },
  teamSize: {
    type: Number,
  },
  status: {
    type: String,
    optional: true
  },
  sender: {
    type: Object,
  },
  'sender.type': {
    type: String,
  },
  'sender.userId': {
    type: String,
    optional: true
  },
  'sender.fullName': {
    type: String,
    optional: true
  },
  recipients: {
    type: Array,
  },
  'recipients.$': {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
  },
  readBy: {
    type: Array,
  },
  'readBy.$': {
    type: Object,
  },
  'readBy.$.readerId': {
    type: String,
    optional: true
  },
  'readBy.$.readAt': {
    type: Date,
    optional: true
  },
  entityType: {
    type: String,
    allowedValues: _.map(NOTIFICATION, e => e)
  },
  entityId: {
    type: String,
  },
  actionOnEntity: {
    type: Object,
    blackbox: true,
  },
  'actionOnEntity.countdown': {
    type: Number,
    optional: true
  },

  isDelete: {
    type: Array
  },

  'isDelete.$': {
    type: Object,
  },
  'isDelete.$.playerId': {
    type: String,
  },
  'isDelete.$.deletedAt': {
    type: Date
  },
});

Schema.Notifications = NotificationsSchema;
Notifications.attachSchema(Schema.Notifications);
Meteor.startup(() => {
  if (Meteor.isServer) {
    Notifications._ensureIndex({ recipients: 1 });
  }
  export default Notifications;
});
