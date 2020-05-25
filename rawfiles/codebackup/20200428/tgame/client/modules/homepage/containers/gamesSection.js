import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import gamesSection from '../components/gamesSection/gamesSection.jsx';
import { MIGRATION_CONST} from '../../../../lib/enum.js';

export const composer = ({ context, clearErrors }, onData) => {
  const { Meteor, Collections } = context();
  if (Meteor.subscribe('games.list').ready()) {
    const games = Collections.Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.tankGameId, MIGRATION_CONST.match3GameId] } }).fetch();
    onData(null, { games });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  contactSubmit: actions.contact.contactSubmit,
  clearErrors: actions.contact.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(gamesSection);
