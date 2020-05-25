import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { get } from 'lodash';
import RankingPage from '../components/RankingPage.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import { MIGRATION_CONST, PACKAGE_TYPES } from '../../../../lib/enum.js';

export const composer = ({ context, history }, onData) => {
  const { Collections } = context();
  const userId = Meteor.userId();

  if (userId) {
    const handleUserAIProd = Meteor.subscribe('userAICode.getAllByUserId', userId);
    const handleGames = Meteor.subscribe('games.list');
    const user = Meteor.user();

    if (handleUserAIProd.ready() && handleGames.ready()) {
      const officialBotReleases = get(user, 'officialBotReleases');
      const botReleases = Collections.UserAICodeProd.find({ userId }, { $sort: { releasedAt: -1 } }).fetch();
      const games = Collections.Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.tankGameId] } }, { fields: { imageUrl: 1, title: 1 } }).fetch()

      onData(null, {
        history, botReleases, officialBotReleases, games
      });
    }
  } else {
    onData(null, { history });
  }
};

export const depsMapper = (context, actions) => ({
  loadPlayerBasicInfo: actions.rankingPage.loadPlayerBasicInfo,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(RankingPage);
