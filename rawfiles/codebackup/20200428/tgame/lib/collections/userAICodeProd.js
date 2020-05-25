import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const UserAICodeProd = new Mongo.Collection('UserAICodeProd');

const Schema = {};

Schema.UserAICodeProd = new SimpleSchema({
  userId: {
    type: String
  },
  gameId: {
    type: String
  },
  releasedAt: {
    type: Date
  },
  TrackName: {
    type: String,
    optional: true,
  },
  releaseName: {
    type: String
  },
  SubTrackName: {
    type: String
  },
  PlayerCode: {
    type: String
  }
});

UserAICodeProd.attachSchema(Schema.UserAICodeProd);

Meteor.startup(() => {
  if (Meteor.isServer) {
    UserAICodeProd._ensureIndex({ userId: 1, gameId: 1 });
  }
  export default UserAICodeProd;
});
