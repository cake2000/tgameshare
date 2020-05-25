import _get from 'lodash/get';
import { ActiveGameList } from "../../../lib/collections";
import { GAME_TYPE } from "../../../lib/enum";


export default function prepareDataUser() {
  const queryUser = {
    $or: [
      { 'profile.coins': { $exists: false } },
      { 'profile.practiceGamesCount': { $exists: false } },
      { 'profile.onlineBattleCount': { $exists: false } },
      { 'profile.battleWonCount': { $exists: false } },
    ]
  };

  const usersShouldBeUpdated = Meteor.users.find(queryUser, {
    fields: {
      _id: 1,
      profile: 1
    }
  }).fetch();

  usersShouldBeUpdated.forEach((user) => {
    const updateProfileData = {};
    if (_get(user, 'profile.coins') === undefined) {
      updateProfileData['profile.coins'] = 1000;
    }
    if (user.profile && !user.profile.practiceGamesCount && user.profile.practiceGamesCount !== 0) {
      updateProfileData['profile.practiceGamesCount'] = ActiveGameList.find({
        gameType: GAME_TYPE.PRACTICE,
        'playerInfo.userId': user._id
      }).count();
    }
    if (_get(user, 'profile.onlineBattleCount') === undefined) {
      updateProfileData['profile.onlineBattleCount'] = ActiveGameList.find({
        gameType: GAME_TYPE.MATCH,
        'playerInfo.userId': user._id
      }).count();
    }
    if (_get(user, 'profile.battleWonCount') === undefined) {
      updateProfileData['profile.battleWonCount'] = ActiveGameList.find({
        gameType: GAME_TYPE.MATCH,
        'playerInfo.userId': user._id,
        winners: user._id
      }).count();
    }
    Meteor.users.update({ _id: user._id }, {
      $set: updateProfileData
    });
  });
}



