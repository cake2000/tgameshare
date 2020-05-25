import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const TBotQA = new Mongo.Collection('TBotQA');

const Schema = {};

Schema.TBotQA = new SimpleSchema({
  category: {
    type: String
  },
  key: { // owner of scenario, by default it is "system"
    type: String
  },
  answer: {
    type: String
  }
});

TBotQA.attachSchema(Schema.TBotQA);

export default TBotQA;
