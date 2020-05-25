export default {
  clearGameRoomNoNotiId({ Meteor }, gameRoomId) {
    Meteor.call('gameRoom.deleteFromGameRoom', gameRoomId, (err) => {
      if (err) {
        console.log("err", err);
      }
    });
  },
  clearGameRoom({ Meteor }, gameRoomId, notiId) {
    console.log(`clearGameRoom ${gameRoomId} ${notiId}`);
    Meteor.call('gameRoom.delete', gameRoomId, notiId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  invitePlayer({ Meteor }, inviteInfo, callback) {
    // console.log("gameRoom.invitePlayer " + JSON.stringify(inviteInfo));
    Meteor.call('gameRoom.invitePlayer', inviteInfo, (err, res) => {
      if (err) {
        console.log('err', err);
      } else {
        return callback(res);
      }
    });
  },
  createGame({ Meteor }, gameOption, defaultItems) {
    Meteor.call('startPracticeGame', gameOption, defaultItems, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  handleSelectOption({ Meteor }, gameRoomId, userId, value) {
    Meteor.call('gameRoom.handleSelectOption', gameRoomId, userId, value, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  handleChangeSlotOption({ Meteor }, gameRoomId, teamID, slot, value) {
    Meteor.call('gameRoom.handleChangeSlotOption', gameRoomId, teamID, slot, value, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  updateAICodeForRobotSlot({ Meteor }, gameRoomId, teamID) {
    Meteor.call('gameRoom.updateAICodeForRobotSlot', gameRoomId, teamID, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  registerUser({ Meteor }, type, gameId, tournamentId, sectionKey, callback) {
    Meteor.call('gameRoom.tournament.registerUser', type, gameId, tournamentId, sectionKey, (err) => {
      if (err) {
        console.log('err', err);
      }
      if (typeof callback === 'function') {
        return callback(err);
      }
    });
  },

  updatePairStatus({ Meteor }, status) {
    check(status, String);
    Meteor.call('tournamentUpdatePairStatus', status, (err) => {
      if (err) {
        console.log('err', err.reason);
      }
    });
  },

  createGameMatch({ Meteor }, gameOption) {
    Meteor.call('gameRoom.startMatchGame', gameOption, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  updateStatus({ Meteor }, gameRoomId) {
    Meteor.call('gameRoom.updateStatus', gameRoomId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  kickUser({ Meteor }, gameRoomId, team, index) {
    Meteor.call('gameRoom.kickUser', gameRoomId, team, index, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  cancleInvite({ Meteor }, gameRoomId, userId) {
    Meteor.call('gameRoom.declineInvite', gameRoomId, userId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  leaveRoom({ Meteor }, gameRoomId) {
    Meteor.call('gameRoom.leaveRoom', gameRoomId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  tournamentLeaveRoom({ Meteor }, gameRoomId) {
    Meteor.call('tournament.leaveRoom', gameRoomId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  tournamentClearRoom({ Meteor }, gameRoomId) {
    Meteor.call('tournament.clearRoom', gameRoomId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  switchTeam({ Meteor }, gameRoomId, team) {
    Meteor.call('gameRoom.switchTeam', gameRoomId, team, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  updatePoint({ Meteor }, roundId, playerId, history, typeOfPlayer) {
    Meteor.call('gameRoom.updatePoint', roundId, playerId, history.location.state.pairData.id, typeOfPlayer, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
    Meteor.call('tournament.seen', history.location.state.notiId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  deleteNotification({ Meteor }, notiId) {
    Meteor.call('tournament.deleteNotification', notiId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  changeSearchKeyword({ LocalState }, keyword) {
    LocalState.set('SEARCH_KEYWORD_USER', keyword);
  },
  changePlayerType({ Meteor }, gameRoomId, playerType, slot, callback = () => {}) {
    Meteor.call('gameRoom.changePlayerType', gameRoomId, playerType, slot, callback);
  },

  hostCancelInvite({ Meteor }, gameRoomId, notiId, userId) {
    Meteor.call('gameRoom.hostCancelInvite', gameRoomId, notiId, userId, (err) => {
      if (err) {
        console.log(err);
      }
    });
  },

  joinRoomByInviteEmail({ Meteor }, gameRoomId, history) {
    Meteor.call('gameRoom.joinRoomByInviteEmail', gameRoomId, (error) => {
      if (error) console.log('error', error);
      else {
        history.push(`/gamesRoomNetwork/${gameRoomId}`);
      }
    });
  },

  userReady({ Meteor }, gameRoomId, newvalue, callback) {
    Meteor.call('gameRoom.userReady', gameRoomId, newvalue, (err) => {
      if (!err) {
        callback(true);
      }
    });
  },

  sendMessage({ Meteor }, gameRoomId, message) {
    Meteor.call('gameRoom.sendMessage', gameRoomId, message);
  },

  setPlayerTyping({ Meteor }, gameRoomId, isTyping) {
    Meteor.call('gameRoom.setPlayerTyping', gameRoomId, isTyping);
  },

  joinTournamentSection({ LocalState }, tournamentId, sectionId, userData, robot, callback) {
    Meteor.call('tournament.joinSection', tournamentId, sectionId, userData, robot, (err) => {
      if (err) { return callback(err.reason.reason); }
      return callback();
    });
  },
  withdrawTournamentSection({ LocalState }, sectionId, userId, callback) {
    Meteor.call('tournament.withdrawSection', sectionId, userId, (err) => {
      if (err) { return LocalState.set('WITHDRAW_TOURNAMENT_SECTION_ERROR', err.reason.reason); }
      LocalState.set('WITHDRAW_TOURNAMENT_SECTION_ERROR', '');
      return callback();
    });
  }
};
