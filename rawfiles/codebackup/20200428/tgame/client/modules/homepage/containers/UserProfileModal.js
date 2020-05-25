/*  global Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import { ROLES } from '../../../../lib/enum';
import UserProfileModal from '../components/playerHome/UserProfileModal.jsx';

export const composer = ({ context, clearErrors, history }, onData) => {
  const { LocalState } = context();
  const userError = LocalState.get('UPDATE_USER_ERROR');
  const userData = Meteor.user();
  let isLoading = true;
  if (userData) {
    isLoading = false;
    const isAIUser = Roles.userIsInRole(Meteor.userId(), ROLES.AI);
    onData(null, {
      userData, isAIUser, userError, isLoading
    });
  } else if (!Meteor.userId()) { history.push('/signin'); }

  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  resetPassword: actions.account.resetPassword,
  updateUserAction: actions.account.updateUser,
  updateUserProfileAction: actions.account.updateUserProfile,
  uploadUserAvatarAction: actions.account.uploadUserAvatar,
  setDefaultCard: actions.account.setDefaultCard,
  removeCard: actions.account.removeCard,
  checkIfCompletedAllLesson: actions.account.checkIfCompletedAllLesson,
  cancelRegistration: actions.account.cancelRegistration,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(UserProfileModal);
