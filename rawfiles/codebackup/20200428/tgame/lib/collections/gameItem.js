import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const GameItem = new Mongo.Collection('gameItem');

const Schema = {};

Schema.GameItem = new SimpleSchema({
  name: {
    type: String
  },
  price: {
    type: Number,
  },
  group: {
    type: String,
    optional: true
  },
  type: { // Cue Stick, Pool Table...
    type: String,
  },
  gameId: {
    type: String,
  },
  imageSrc: {
    type: Object,
    blackbox: true
  },
  defaultInTypes: {
    type: Boolean,
  }
});
GameItem.attachSchema(Schema.GameItem);
Meteor.startup(() => {
  if (Meteor.isServer) {
    GameItem._ensureIndex({ type: 1 });
  }
  export default GameItem;
});
