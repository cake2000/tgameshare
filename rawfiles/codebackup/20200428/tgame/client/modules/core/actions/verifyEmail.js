import _isFunction from 'lodash/isFunction';
import { VERIFY_MESSAGE } from '../../../../lib/const';

export default {
  clearErrors({ LocalState }) {
    LocalState.set('VERIFY_TEXT', null);
    LocalState.set('SIGNUP_ISRESENDVERIFY', false);
  },

  verifyEmail({ LocalState }, token, history) {
    Accounts.verifyEmail(token, (error) => {
      if (error) {
        return LocalState.set('VERIFY_TEXT', VERIFY_MESSAGE.VERIFY_ERROR);
      }
      return history.push('/player');
    });
  },

  resendVerifyEmail({ LocalState }, userId, callback) {
    LocalState.set('SIGNUP_ISRESENDVERIFY', true);
    Meteor.call('accountsResendVerify', userId, (err) => {
      if (_isFunction(callback)) callback(err);
      if (err) {
        LocalState.set('SIGNUP_ERROR', err.reason);
        return LocalState.set('SIGNUP_ISRESENDVERIFY', false);
      }
      LocalState.set('SIGNUP_SUCCESS', true);
      return LocalState.set('SIGNUP_ISRESENDVERIFY', false);
    });
  }
};
