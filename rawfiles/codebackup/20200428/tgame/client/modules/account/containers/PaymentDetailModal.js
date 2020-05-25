import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import PaymentDetailModal from '../components/PaymentDetailModal.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections } = context();

  onData(null, { });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  subscribeToPlan: actions.account.subscribeToPlan,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(PaymentDetailModal);
