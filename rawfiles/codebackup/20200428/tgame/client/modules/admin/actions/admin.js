export default {
  clearErrors({ LocalState }) {
    LocalState.set('ADMIN_HOMEPAGE_ERROR', null);
  },

  updateHomePage({ LocalState }, homepageData, callback) {
    Meteor.call('adminUpdateHomepage', homepageData, (err) => {
      if (err) { LocalState.set('ADMIN_HOMEPAGE_ERROR', err.reason); } else {
        callback();
      }
    });
  },

  updateGame({ LocalState }, gameId, game, callback) {
    Meteor.call('adminUpdateGame', gameId, game, (err) => {
      if (err) { LocalState.set('ADMIN_GAME_ERROR', err.reason); } else {
        callback();
      }
    });
  },

  updateTournament({ LocalState }, tournamentId, tournament, callback) {
    Meteor.call('adminUpdateTournament', tournamentId, tournament, (err) => {
      if (err) { LocalState.set('ADMIN_TOURNAMNET_ERROR', err.reason); } else {
        callback();
      }
    });
  },

  updateGeneral({ LocalState }, generalData, callback) {
    Meteor.call('adminUpdateGeneral', generalData, (err) => {
      if (err) { LocalState.set('ADMIN_GENERAL_ERROR', err.reason); } else {
        callback();
      }
    });
  },
};
