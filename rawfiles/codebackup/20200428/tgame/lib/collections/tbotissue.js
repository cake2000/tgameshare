import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const TBotIssue = new Mongo.Collection('TBotIssue');

const Schema = {};

Schema.TBotIssue = new SimpleSchema({
  chatId: {
    type: String,
  },
  userId: { // owner of scenario, by default it is "system"
    type: String,
  },
  username: { // owner of scenario, by default it is "system"
    type: String
  },
  scenarioId: {
    type: String
  },
  // gameId: {
  //   type: String
  // },
  // gameName: {
  //   type: String
  // },
  time: {
    type: Date,
  },
  lastUserText: {
    type: String,
  },
  status: {
    type: String, // new / inreview / closed
  },
  handler: {
    defaultValue: "",
    optional: true,
    type: String // who is handling the issue
  }
});

TBotIssue.attachSchema(Schema.TBotIssue);

export default TBotIssue;
