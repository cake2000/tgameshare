import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminGamePracticeTab from '../../components/Games/AdminGamePracticeTab.jsx';

export const composer = ({ context, clearErrors, gameId }, onData) => {
  const { Meteor, LocalState } = context();
  const err = LocalState.get('ADMIN_GAME_ERROR');
  if (gameId) {
    if (Meteor.subscribe('tutorials.list', gameId).ready()) {
      onData(null, { err });
    }
  } else {
    onData(null, { err, lessons: null });
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
)(AdminGamePracticeTab);
