/* global Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GameRoomTournamentData from '../components/GameRoomTournamentData.jsx';
import { ROLES } from '../../../../lib/enum';

export const composer = ({ context, gameId }, onData) => {
  const { Meteor, Collections } = context();
  const loading = Meteor.subscribe('tournament.list', gameId).ready();

  if (loading) {
    const tournaments = Collections.Tournament.find({ gameId }).fetch();
    const isAIUser = Roles.userIsInRole(Meteor.userId(), ROLES.AI);
    const isHumanUser = Roles.userIsInRole(Meteor.userId(), ROLES.MANUAL);
    const visibleTournaments = tournaments.filter(tournament =>
      ((isAIUser === true && tournament.isAIOnly === true)
        || (isHumanUser === true && tournament.isHumanOnly === true)
        || (tournament.isHumanOnly === false && tournament.isAIOnly === false)));
    let currentRating = 0;
    if (Meteor.user() && Meteor.user().playGames) {
      currentRating = Meteor.user().playGames.find(item => item.gameId === gameId).rating;
    }
    onData(null, {
      visibleTournaments: tournaments, currentRating,
    });
  }
};

export const depsMapper = context => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameRoomTournamentData);
