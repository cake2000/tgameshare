import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Games } from '../../lib/collections';

export default function () {
  Meteor.methods({
    'games.item'(itemId) {
      check(itemId, String);
      return Games.findOne({ _id: itemId });
    }
  });
}
