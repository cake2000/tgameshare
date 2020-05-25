import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const UserScratchAIFile = new Mongo.Collection('UserScratchAIFile');

const Schema = {};

Schema.UserScratchAIFile = new SimpleSchema({
  UserID: {
    type: String
  },
  gameId: {
    type: String
  },
  username: {
    type: String
  },
  useremail: {
    type: String
  },
  filename: {
    type: String
  },
  key: {
    type: String
  },
  rkey: {
    type: String
  },
  asOfTime: {
    type: Date
  },
  data: {
    type: String
  },    
});

UserScratchAIFile.attachSchema(Schema.UserScratchAIFile);

Meteor.startup(() => {
  if (Meteor.isServer) {
    UserScratchAIFile._ensureIndex({ UserID: 1, gameId: 1 });
  }
  export default UserScratchAIFile;
});
