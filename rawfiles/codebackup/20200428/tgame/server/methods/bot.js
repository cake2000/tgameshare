import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function () {
  Meteor.methods({
    updateRobotCodeId(robotCodeId, gameId) {
      check([robotCodeId, gameId], [String]);
      const userId = Meteor.userId();

      Meteor.users.update(
        {
          _id: userId,
          'playGames.gameId': gameId
        },
        {
          $set: {
            'playGames.$.robotCodeId': robotCodeId
          }
        }
      ); // end update
    }
  });
}
