export default {
  clearErrors({ LocalState }) {
    LocalState.set('CLICK_ACCEPT', null);
    LocalState.set('CLICK_DECLINE', null);
  },
  accept({ LocalState, Meteor }, gameRoomId, notiId, history) {
    Meteor.call('gameRoom.acceptInvite', gameRoomId, notiId, (err, res) => {
      if (!err) {
        LocalState.set('CLICK_ACCEPT', notiId);
        history.push(`/gamesRoomNetwork/${res}`);
      }
    });
  },
  decline({ LocalState, Meteor }, gameRoomId, notiId) {
    Meteor.call('gameRoom.declineInvite', gameRoomId, notiId, (err) => {
      if (!err) {
        LocalState.set('CLICK_DECLINE', notiId);
      }
    });
  },
  setAllNotiAsRead() {
    Meteor.call('notification.setAllAsRead');
  }
};
