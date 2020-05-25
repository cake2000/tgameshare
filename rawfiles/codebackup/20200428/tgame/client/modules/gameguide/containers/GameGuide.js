import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GameGuide from '../components/GameGuide.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import { MIGRATION_CONST} from '../../../../lib/enum.js';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections, Meteor } = context();
  let gamesList = null;

  if (Meteor.subscribe('games.list').ready()) {
    gamesList = Collections.Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.algorithmGameId, MIGRATION_CONST.canvasGameId, MIGRATION_CONST.tankGameId, MIGRATION_CONST.match3GameId] } }).fetch();
  }
  onData(null, { gamesList });
  return clearErrors;
};

export const depsMapper = context => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(GameGuide);
