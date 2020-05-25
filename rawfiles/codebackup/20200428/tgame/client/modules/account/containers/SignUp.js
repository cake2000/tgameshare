import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { parse } from 'qs';

import { ParentEmail } from '../../../../lib/collections';
import SignUp from '../components/SignUp.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';


export const composer = ({ context, clearErrors, history }, onData) => {
  const { LocalState } = context();
  let loading = true;
  let query = {};
  let checkParentEmail = false;
  const search = history.location.search;
  if (search) {
    query = parse(search.substr(1));
    const { parentEmail, key } = query;
    if (parentEmail && key) {
      if (Meteor.subscribe('parentEmailCheckEmail', parentEmail).ready()) {
        checkParentEmail = Boolean(ParentEmail.findOne({ email: parentEmail, key }));
        loading = false;
      }
    } else loading = false;
  } else {
    loading = false;
  }
  const error = LocalState.get('SIGNUP_ERROR');
  const success = LocalState.get('SIGNUP_SUCCESS');
  const userId = LocalState.get('SIGNUP_USERID');
  const isSubmit = LocalState.get('SIGNUP_ISSUBMIT');
  const isResend = LocalState.get('SIGNUP_ISRESENDVERIFY');
  onData(null, { error, query, success, userId, isSubmit, isResend, loading, checkParentEmail });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  joinRoomByInviteEmail: actions.gameRoom.joinRoomByInviteEmail,
  clearErrors: actions.account.clearErrors,
  createUser: actions.account.createUser,
  resendVerifyEmail: actions.account.resendVerifyEmail,
  sendParentEmail: actions.account.sendParentEmail,
  login: actions.account.login,
  accept: actions.invite.accept,
  updateUserProfile: actions.account.updateUserProfile,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(SignUp);
