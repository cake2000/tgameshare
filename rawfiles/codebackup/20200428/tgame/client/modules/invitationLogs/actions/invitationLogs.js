export default {
  fetchInvitationLogs({ LocalState, Meteor }, limit, callback) {
    LocalState.set('INVITATION_LOG_LOADING', true);
    Meteor.call('fetch.invitationLogs', limit, (err, res) => {
      if (!err) {
        LocalState.set('INVITATION_LOG_LOADING', false);
        return callback(res);
      }
    });
  }
};
