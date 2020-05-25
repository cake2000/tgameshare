import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminTournament from '../../components/Tournament/AdminTournament.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Meteor, LocalState, Collections } = context();
  const err = LocalState.get('ADMIN_TOURNAMENT_ERROR');
  if (Meteor.subscribe('adminGetTournamentList').ready()) {
    const tournaments = Collections.Tournament.find().fetch();
    onData(null, { err, tournaments });
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
)(AdminTournament);

