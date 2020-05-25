import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import UpgradeAccountModal from '../components/UpgradeAccountModal.jsx';
import { ADMIN_PUBLICATION } from '../../../../lib/enum.js';


export const composer = ({ context, clearErrors }, onData) => {
  const { Collections } = context();

  if (Meteor.subscribe('adminAccountData').ready()) {
    const accountData = Collections.Admin.findOne({ type: ADMIN_PUBLICATION.TYPES.ACCOUNTS });
    onData(null, { accountData: accountData.data });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  resetPassword: actions.account.resetPassword,
  updateUserAction: actions.account.updateUser,
  deactiveAccount: actions.account.deactiveAccount,
  subscribeToPlan: actions.account.subscribeToPlan,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(UpgradeAccountModal);
