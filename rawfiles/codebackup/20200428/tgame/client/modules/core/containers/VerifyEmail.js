import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import VerifyEmail from '../components/VerifyEmail.jsx';
import { VERIFY_MESSAGE } from '../../../../lib/const';

export const composer = ({ context }, onData) => {
  const { LocalState } = context();
  const text = LocalState.get('VERIFY_TEXT') || VERIFY_MESSAGE.VERIFY;

  onData(null, { text });
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.verifyEmail.clearErrors,
  verifyEmail: actions.verifyEmail.verifyEmail,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(VerifyEmail);
