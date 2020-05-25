import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import SignIn from '../components/SignIn.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { LocalState } = context();
  const error = LocalState.get('SIGNIN_ERROR');
  onData(null, { error });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  login: actions.account.login,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(SignIn);
