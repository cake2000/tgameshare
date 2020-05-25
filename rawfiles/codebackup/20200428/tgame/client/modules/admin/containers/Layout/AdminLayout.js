/* global Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminLayout from '../../components/Layout/AdminLayout.jsx';
import { ROLES } from '../../../../../lib/enum';

export const composer = ({ context, clearErrors, history }, onData) => {
  const { Meteor } = context();
  if (Meteor.userId()) {
    if (Meteor.user() && Meteor.subscribe('usersGetUserData').ready()) {
      const isAdmin = Roles.userIsInRole(Meteor.userId(), ROLES.SUPER_ADMIN);
      const isSupport = Roles.userIsInRole(Meteor.userId(), ROLES.SUPPORT);
      onData(null, { isAdmin, isSupport });
    }
  } else {
    history.push('/signin');
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  updateHomePage: actions.admin.updateHomePage,
  clearErrors: actions.admin.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AdminLayout);
