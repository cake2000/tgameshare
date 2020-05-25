export default {
  clearGameBoardData({ LocalState }) {
    LocalState.set('GAME_SELECTED', null);
    LocalState.set('GAME_LEVEL', null);
    LocalState.set('GAME_RELEASE', null);
    LocalState.set('GAME_CURRENT_SECTION', null);
    LocalState.set('GAME_MODE', null);
  },
  selectGame({ LocalState }, game) {
    LocalState.set('GAME_SELECTED', game);
  },
  selectLevel({ LocalState }, level) {
    LocalState.set('GAME_LEVEL', level);
  },
  setLinkForGameRoom({ LocalState }, link, mode) {
    LocalState.set('GAME_ROOM_LINK', link);
    LocalState.set('GAME_MODE', mode);
  },
  selectGameRelease({ LocalState }, release) {
    LocalState.set('GAME_RELEASE', release);
  },
  selectCurrentSection({ LocalState }, number) {
    LocalState.set('GAME_CURRENT_SECTION', number);
  },
  createGameRoom({ Meteor }, gameData, callback) {
    Meteor.call('gameRoom.create', gameData, (err, res) => {
      if (!err) {
        return callback(res);
      }

      return console.error('Error occured when call gameRoom.create method', err);
    });
  },
  updateRobotCodeId({ Meteor }, robotCodeId, gameId) {
    Meteor.call('updateRobotCodeId', robotCodeId, gameId, (err) => {
      if (err) console.log('UPDATE ROBOT CODE ID EXCEPTION: ', err);
    });
  },
  showWarningModal({ LocalState }, generalModalInfo) {
    LocalState.set('GENERAL_MODAL_INFO', generalModalInfo);
  }
};
