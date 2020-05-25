import { Meteor } from 'meteor/meteor';

export default {
  reportNewGameMove(gameRoomId,
    playerUserId, forcex, forcey, avx, avy, targetPocketID, targetBallID) {
    Meteor.call('reportNewGameMove', gameRoomId, playerUserId, forcex, forcey, avx, avy, targetPocketID, targetBallID, (err) => {
      if (err) {
        console.log('error in reportNewGameMove ');
      }
    });
  },
  reportPlaceCueBallMove(gameRoomId, playerUserId, newx, newy) {
    Meteor.call('reportPlaceCueBallMove', gameRoomId, playerUserId, newx, newy, (err) => {
      if (err) {
        console.log('error in reportPlaceCueBallMove ');
      }
    });
  },

  reportQuitGame(gameRoomId) {
    Meteor.call('reportQuitGame', gameRoomId, (err) => {
      if (err) {
        console.log('error in reportQuitGame ');
      }
    });
  },
  leavingGame(gameRoomId, playerID, failedToReconnect, gameState, teamWon, callback = null) {
    // console.log("leaving room 3 not used!!");
    Meteor.call('leavingGame', gameRoomId, playerID, failedToReconnect, gameState, teamWon, (err, result) => {
      if (typeof callback === 'function') {
        callback(err, result);
      }
      if (err) {
        console.log('error in leavingGame ');
      }
    });
  },
  reportEnteringGameRoom(gameRoomId, playerID) {
    Meteor.call('reportEnteringGameRoom', gameRoomId, playerID, (err) => {
      if (err) {
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {

      }
    });
  },
  saveBallPosSnapshot(gameRoomId, ballposlist) {
    Meteor.call('saveBallPosSnapshot', gameRoomId, ballposlist, (err) => {
      if (err) {
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      }
    });
  },

  saveDataToCollection(collectionID, data) {
    Meteor.call('saveDataToCollection', collectionID, data, (err) => {
      if (err) {
        console.log(`error in saveDataToCollection ${err.message}`);
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      }
    });
  },

  loadDataFromCollection(collectionID) {
    Meteor.call('loadDataFromCollection', collectionID, (err, data) => {
      if (err) {
        console.log(`error in loadDataFromCollection ${err.message}`);
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {
        return data;
      }
    });
  },

  reportGameResult(gameRoomId, winnerPlayerUserId) {
    Meteor.call('recordGameResult', gameRoomId, winnerPlayerUserId, (err) => {
      if (err) {
        console.log('error in reportNewGameMove ');
      }
    });
  },

  reportPlayerReadyToPlay(gameRoomId) {
    Meteor.call('reportPlayerReadyToPlay', gameRoomId, (err) => {
      if (err) {
                    // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {

      }
    });
  },

  reportAllBallStopped(gameRoomId) {
    Meteor.call('reportAllBallStopped', gameRoomId, (err) => {
      if (err) {
                    // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {

      }
    });
  },

  finishTournamentSectionRound(roundId, playerId, pairIndex, typeOfPlayer) {
    Meteor.call('finishTournamentSectionRound', roundId, playerId, pairIndex, typeOfPlayer, (err) => {
      if (err) {
        console.log(err.reason);
      }
    });
  },
};
