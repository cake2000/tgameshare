import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function () {
  Meteor.methods({
    loadUserCoins: (userId) => {
      check(userId, String);

      return Meteor.users.findOne(userId).profile.coins;
    }
  });
}
