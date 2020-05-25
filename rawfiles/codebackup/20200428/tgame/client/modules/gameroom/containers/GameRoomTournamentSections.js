import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GameRoomTournamentSections from '../components/GameRoomTournamentSections.jsx';
import { TOURNAMENT_STATUS, TOURNAMENT_SECTION_TYPE } from '../../../../lib/enum';

export const composer = ({ context, tournament, title }, onData) => {
  const { Meteor, Collections } = context();

  if (Meteor.subscribe('tournamentSection.list', tournament._id).ready()) {
    let sections = Collections.TournamentSection.find({
      tournamentId: tournament._id,
    }).fetch();
    if (tournament.status !== TOURNAMENT_STATUS.PREPARED) {
      // sections = sections.filter(section => section.type !== TOURNAMENT_SECTION_TYPE.NEW_REGISTRATION);
    }
    onData(null, { sections, title });
  }
};

export const depsMapper = (context, actions) => ({
  withdrawTournamentSection: actions.gameRoom.withdrawTournamentSection,
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameRoomTournamentSections);
