import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import PaymentModal from '../components/PaymentModal.jsx';

export const composer = ({ clearErrors }, onData) => {

  onData(null, { });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  stripeBuyACourse: actions.account.stripeBuyACourse,
  searchCourseCoupon: actions.account.searchCourseCoupon,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(PaymentModal);
