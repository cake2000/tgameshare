import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminGameForm from '../../components/Games/AdminGameForm.jsx';


export const composer = ({ context, clearErrors, gameId }, onData) => {
  // const { Collections, Meteor, LocalState } = context();
  onData(null, {});
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  updateGame: actions.admin.updateGame,
  clearErrors: actions.admin.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AdminGameForm);
