import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminGames from '../../components/Games/AdminGames.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections, Meteor, LocalState } = context();
  const err = LocalState.get('ADMIN_GAME_ERROR');
  if (Meteor.subscribe('games.list').ready()) {
    const games = Collections.Games.find().fetch();
    onData(null, { err, games });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.admin.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AdminGames);
