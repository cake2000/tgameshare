import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ChallengeHistory = new Mongo.Collection('challengeHistory', {
  transform: challengeHistory => challengeHistory
});
const Schema = {};

Schema.UserData = new SimpleSchema({
  _id: String,
  rating: Number,
  ratingChange: Array,
  'ratingChange.$': String,
  botReleaseId: String
});

Schema.ChallengeHistory = new SimpleSchema({
  ownerId: {
    type: String,
    label: 'Id of user who creates the challenge'
  },
  winnerId: {
    type: String,
    optional: true
  },
  challenger: {
    type: Schema.UserData
  },
  defender: {
    type: Schema.UserData
  },

  // meta data
  createdAt: Date,
  gameId: String
});

ChallengeHistory.attachSchema(Schema.ChallengeHistory);

export default ChallengeHistory;
