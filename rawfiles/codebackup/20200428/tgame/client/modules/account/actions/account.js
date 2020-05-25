/* global Roles */
import { Accounts, AccountsClient } from 'meteor/accounts-base';
import _ from 'lodash';
import { parse } from 'qs';
import { ROLES } from '../../../../lib/enum';
import { getBase64String } from '../../../../lib/util';
import { setGAUserIDAndType } from '../../../lib/GA';

export default {
  clearErrors({ LocalState }) {
    LocalState.set('SIGNUP_ERROR', null);
    LocalState.set('SIGNUP_SUCCESS', null);
    LocalState.set('SIGNIN_ERROR', null);
  },
  createUser({ LocalState }, formData, history, callback) {
    LocalState.set('SIGNUP_ERROR', null);
    LocalState.set('SIGNUP_ISSUBMIT', true);
    Meteor.call('accountsCreate', formData, (err, result) => {
      if (err) {
        console.log(err);
        LocalState.set('SIGNUP_ERROR', err.reason);
        return LocalState.set('SIGNUP_ISSUBMIT', false);
      }
      LocalState.set('SIGNUP_USERID', result.userId);
      LocalState.set('SIGNUP_SUCCESS', true);
      LocalState.set('SIGNUP_ISSUBMIT', false);
      if (!result.isVerified) {
        history.push(`/resend-verification/${result.userId}`);
      }
      callback(err, result);
    });
  },
  login({ LocalState }, email, password, history, callback = () => { }) {
    Meteor.loginWithPassword(email, password, (errLogin) => {
      callback(errLogin);
      if (errLogin) {
        let errorReason = errLogin.reason;
        if (errorReason === 'User not found') {
          errorReason = 'Login failed';
        }
        return LocalState.set('SIGNIN_ERROR', errorReason);
      }
      const search = _.get(history, 'location.search', '');
      if (search) {
        const query = parse(search.substr(1));
        const { sso, sig } = query;
        if (sso && sig) {
          return history.push(`/discourse/sso${search}`);
        }
      }
      Meteor.logoutOtherClients();

      if (Roles.userIsInRole(Meteor.userId(), 'superAdmin')) {
        // return history.push('/admin');
      }

      if (Roles.userIsInRole(Meteor.userId(), ROLES.SUPPORT)) {
        return history.push('/admin/chat-support');
      }

      // Send User ID and Type to Google Analytics session
      setGAUserIDAndType();

      return history.push('/player');
    });
  },
  resendVerifyEmail({ LocalState }, userId) {
    LocalState.set('SIGNUP_ISRESENDVERIFY', true);
    Meteor.call('accountsResendVerify', userId, (err) => {
      if (err) {
        LocalState.set('SIGNUP_ERROR', err.reason);
        return LocalState.set('SIGNUP_ISRESENDVERIFY', false);
      }
      LocalState.set('SIGNUP_SUCCESS', true);
      return LocalState.set('SIGNUP_ISRESENDVERIFY', false);
    });
  },
  resetPassword({ LocalState }, email, callback) {
    Meteor.call('accountsResetPassword', email, (err) => {
      callback();
      if (err) {
        return LocalState.set('FORGOT_PASSWORD_ERROR', err.reason);
      }
      return LocalState.set('FORGOT_PASSWORD_SUCCESS', true);
    });
  },
  updatePassword({ LocalState }, newPassword, token, callback) {
    Meteor.call('accountsUpdatePassword', newPassword, token, (err) => {
      callback();
      if (err) {
        return LocalState.set('RESET_PASSWORD_ERROR', err.reason);
      }
      return LocalState.set('RESET_PASSWORD_SUCCESS', true);
    });
  },
  updateUser({ LocalState }, userData, callback) {
    Meteor.call('accountsUpdateUserData', userData, (err) => {
      if (err) {
        return callback(err.reason);
        // return LocalState.set('UPDATE_USER_ERROR', err.reason);
      }
      // LocalState.set('UPDATE_USER_ERROR', '');
      return callback();
    });
  },

  updateUserProfile({ LocalState }, userData, callback) {
    Meteor.call('accountsUpdateUserProfile', userData, (err) => {
      if (err) {
        return callback(err.reason);
        // return LocalState.set('UPDATE_USER_ERROR', err.reason);
      }
      // LocalState.set('UPDATE_USER_ERROR', '');
      return callback();
    });
  },

  addCustomerStripeCard({}, sourceId, callback) {
    Meteor.call('stripeAddCustomerStripeCard', sourceId, (err) => {
      callback(err);
      return true;
    });
  },

  subscribeToPlan({ LocalState }, sourceId, planId, coupon, selectedStudents, callback) {
    Meteor.call('stripeSubscribeToPlan', sourceId, planId, coupon, selectedStudents, (err) => {
      callback(err);
    });
  },

  setDefaultCard({ LocalState }, sourceId, callback) {
    Meteor.call('stripeSetDefaultCard', sourceId, (err) => {
      if (err) { return LocalState.set('ADD_CUSTOMER_STRIPE_CARD_ERROR', err.reason); }
      callback();
      return true;
    });
  },

  removeCard({ LocalState }, sourceId, callback) {
    Meteor.call('stripeRemoveCard', sourceId, (err) => {
      if (err) { return LocalState.set('REMOVE_STRIPE_CARD_ERROR', err.reason); }
      callback();
      return true;
    });
  },

  changePassword({ LocalState }, username, oldPassword, newPassword, callback) {
    Accounts.changePassword(oldPassword, newPassword, callback);
  },

  deactiveAccount({ LocalState }, callback) {
    Meteor.call('accountToggleActive', (err) => {
      if (!err) callback();
    });
  },

  addStripeCustomer({ LocalState }, accountType, callback) {
    Meteor.call('accountAddCreateStripe', accountType, () => {
      callback();
    });
  },

  sendParentEmail({ LocalState }, parentEmail, dateOfBirth, callback) {
    Meteor.call('accountSendParentEmail', parentEmail, dateOfBirth, callback);
  },

  sendInviteEmail({ LocalState }, parentEmail, gameRoomId, callback) {
    Meteor.call('accountSendInviteEmail', parentEmail, gameRoomId, callback);
  },

  uploadUserAvatar({ LocalState }, file, callback) {
    getBase64String(file, { width: 180, height: 180 }, (base64String) => {
      const imageInfo = {
        title: file.name,
        size: file.size,
        url: base64String
      };

      Meteor.call('accountUploadUserAvatar', imageInfo, (error, res) => {
        if (_.isFunction(callback)) callback(error, res);
      });
    });
  },
  checkIfCompletedAllLesson({ LocalState }, callback) {
    Meteor.call('checkIfCompletedAllLesson', (err, res) => {
      if (_.isFunction(callback)) callback(err, res);
    });
  },
  cancelRegistration({ LocalState }, callback) {
    Meteor.call(
      'cancelRegistrationAsTeacher',
      (err, res) => {
        if (_.isFunction(callback)) callback(err, res);
      }
    );
  },
  registerAsTeacher({ LocalState }, userInfo, callback) {
    Meteor.call(
      'registerAsTeacher',
      userInfo,
      (err, res) => {
        if (_.isFunction(callback)) callback(err, res);
      }
    );
  },
  addNewClass({ LocalState }, classId, callback) {
    Meteor.call('accountAddNewClass', classId, callback);
  },
  removeClass({ LocalState }, classId, callback) {
    Meteor.call('accountRemoveClass', classId, callback);
  },
  updateClass({ LocalState }, currentClassId, classId, callback) {
    Meteor.call('accountUpdateClass', currentClassId, classId, callback);
  },
  getClassesForTeacher({ Meteor }, teacherId, callback) {
    Meteor.call('getClassListBasedOnTeacher', teacherId, callback);
  },
  applyCoupon({ LocalState }, coupon, callback) {
    Meteor.call('findCoupon', coupon, (err, res) => {
      callback(err, res);
    });
  },
  cancelStudentSubscription({ LocalState }, student, callback) {
    Meteor.call('stripeCancelStudentSubscription', student, err => callback(err));
  },

  stripeBuyACourse({ LocalState }, gameId, packageType, sourceId, coupon, callback) {
    Meteor.call('stripeBuyACourse', gameId, packageType, sourceId, coupon, err => callback(err));
  },

  searchCourseCoupon({ LocalState }, coupon, callback) {
    Meteor.call('findCourseCoupon', coupon, (err, res) => {
      if (err) {
        callback(err.reason);
      } else {
        callback(null, res);
      }
    });
  }
};
