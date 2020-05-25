import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ForgotPassword from '../components/ForgotPassword.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { LocalState } = context();
  const error = LocalState.get('FORGOT_PASSWORD_ERROR');
  const success = LocalState.get('FORGOT_PASSWORD_SUCCESS');
  onData(null, { error, success });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  resetPassword: actions.account.resetPassword,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(ForgotPassword);
