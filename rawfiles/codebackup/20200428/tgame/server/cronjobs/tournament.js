/* eslint no-underscore-dangle: 0*/
/* global Roles */


export const startTournament = (tournament) => {
  check(tournament, Object);
  Meteor.call('startTournament', tournament);
};

