import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ResetPassword from '../components/ResetPassword.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { LocalState } = context();
  const error = LocalState.get('RESET_PASSWORD_ERROR');
  const success = LocalState.get('RESET_PASSWORD_SUCCESS');
  onData(null, { error, success });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  updatePassword: actions.account.updatePassword,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(ResetPassword);
