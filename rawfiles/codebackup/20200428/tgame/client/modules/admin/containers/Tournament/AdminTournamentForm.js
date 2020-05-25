import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminTournamentForm from '../../components/Tournament/AdminTournamentForm.jsx';


export const composer = ({ context, clearErrors, tournamentId }, onData) => {
  const { Collections, Meteor, LocalState } = context();
  const err = LocalState.get('ADMIN_TOURNAMENT_ERROR');
  if (Meteor.subscribe('adminGetGameListDropDown').ready()) {
    const games = Collections.Games.find({}, { fields: {
      _id: 1,
      title: 1
    } }).fetch();
    if (tournamentId) {
      if (Meteor.subscribe('adminGetTournamentItem', tournamentId).ready()
        && Meteor.subscribe('adminGetTournamentSections', tournamentId).ready()) {
        const sections = Collections.TournamentSection.find({ tournamentId }).fetch();
        const tournament = Collections.Tournament.findOne({ _id: tournamentId });
        tournament.sections = sections;
        onData(null, { err, tournament, games });
      }
    } else {
      onData(null, { err, games });
    }
  }

  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  updateTournament: actions.admin.updateTournament,
  clearErrors: actions.admin.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AdminTournamentForm);
