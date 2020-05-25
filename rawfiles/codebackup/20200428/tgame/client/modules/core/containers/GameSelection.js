import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _ from 'lodash';
import GameSelection from '../components/GameSelection.jsx';
import { MIGRATION_CONST} from '../../../../lib/enum.js';

export const composer = ({ context, listGames }, onData) => {
  const { Collections, Meteor } = context();

  if (_.isArray(listGames) && listGames.length > 0) {
    onData(null, { listGames, isLoading: false });
  } else {
    const subscribeGamesList = Meteor.subscribe('games.list');

    if (subscribeGamesList.ready()) {
      const _listGames = Collections.Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.tankGameId, MIGRATION_CONST.match3GameId] } }, { sort: { _id: -1 } }).fetch();

      onData(null, { listGames: _listGames, isLoading: false });
    } else {
      onData(null, { listGames: [], isLoading: true });
    }
  }
};

export const depsMapper = context => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameSelection);
