export default {
  clearErrors({ LocalState }) {
    LocalState.set('CONTACT_ERROR', null);
    LocalState.set('CONTACT_SUCCESS', null);
  },
  contactSubmit({ LocalState }, email, subject, message, callback) {
    Meteor.call('contactCreate', email, subject, message, (err) => {
      if (err) {
        callback.clearLoading();
        return LocalState.set('CONTACT_ERROR', err.reason);
      }
      callback.clearLoading();
      callback.resetForm();
      callback.toggleNoti();
      return LocalState.set('CONTACT_SUCCESS', true);
    });
  },
  activeAccount({ LocalState }, callback) {
    Meteor.call('accountToggleActive', (err) => {
      if (!err) callback();
    });
  }
};
