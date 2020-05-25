import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ResendVerification from '../components/ResendVerification.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { LocalState } = context();
  const error = LocalState.get('SIGNUP_ERROR');
  const success = LocalState.get('SIGNUP_SUCCESS');

  onData(null, { error, success });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  resendVerifyEmail: actions.account.resendVerifyEmail,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(ResendVerification);
