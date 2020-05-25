import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { ROLES, CHALLENGE_HISTORY_LENGTH } from '../../../../lib/enum.js';
import PlayerBasicInfo from '../components/PlayerBasicInfo.jsx';

export const composer = ({
  context, clearErrors
}, onData) => {
  const { Collections, LocalState } = context();
  const playerId = LocalState.get('PLAYER_ID');
  if (playerId) {
    const playerProfileHandle = Meteor.subscribe('users.getProfileUserChallenge', playerId);
    // hidden game list
    // const handleGameList = Meteor.subscribe('games.list');
    // if (playerProfileHandle.ready() && handleGameList.ready()) {
    if (playerProfileHandle.ready()) {
      const isAIUser = Roles.userIsInRole(playerId, ROLES.AI);
      // const gamesList = Collections.Games.find({}, { $sort: { _id: -1 } }).fetch();
      const challengeHistoryList = Collections.ChallengeHistory.find({
        $or: [
          { 'challenger._id': playerId },
          { 'defender._id': playerId }
        ]
      }, {
        sort: { createdAt: -1 },
        limit: CHALLENGE_HISTORY_LENGTH
      }).fetch();
      const playerInfo = Meteor.users.findOne(
        { _id: playerId },
        {
          fields: {
            avatar: 1,
            username: 1,
            'profile.coins': 1,
            'profile.practiceGamesCount': 1,
            'profile.onlineBattleCount': 1,
            'profile.battleWonCount': 1
          }
        }
      );

      onData(null, {
        playerInfo, isAIUser, /* gamesList, */ challengeHistoryList, playerId
      });
    }
  }

  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  loadPlayerBasicInfo: actions.rankingPage.loadPlayerBasicInfo,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(PlayerBasicInfo);
