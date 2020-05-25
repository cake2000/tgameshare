import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ChangePassword from '../components/ChangeAccountPasswordModal.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  // const { LocalState } = context();

  onData(null, {});
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  changePassword: actions.account.changePassword,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(ChangePassword);
