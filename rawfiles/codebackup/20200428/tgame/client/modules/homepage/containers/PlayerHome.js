import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import PlayerHome from '../components/playerHome/PlayerHome.jsx';
import { ROLES } from '../../../../lib/enum.js';
import { MIGRATION_CONST, PACKAGE_TYPES } from '../../../../lib/enum.js';

export const composer = ({ context, clearErrors, history }, onData) => {
  const { Collections } = context();
  const userId = Meteor.userId();
  if (!userId) {
    history.push('/signin');
    return;
  }
  const playerProfileHandle = Meteor.subscribe('users.getProfileUser', userId);
  const handleGameList = Meteor.subscribe('games.list');
  if (playerProfileHandle.ready() && handleGameList.ready()) {
    const isAIUser = Roles.userIsInRole(userId, ROLES.AI);
    const gamesList = Collections.Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.canvasGameId, MIGRATION_CONST.algorithmGameId, MIGRATION_CONST.tankGameId, MIGRATION_CONST.match3GameId] } }, { $sort: { _id: -1 } }).fetch();
    const user = Meteor.users.findOne(
      { _id: userId },
      {
        fields: {
          profile: 1,
          playGames: 1,
          avatar: 1
        }
      }
    );
    onData(null, { user, isAIUser, gamesList });
  }

  return clearErrors;
};

export const depsMapper = context => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(PlayerHome);
