import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import ChooseRoleComponent from '../components/ChooseRoleComponent.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  onData(null, { });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  addStripeCustomer: actions.account.addStripeCustomer,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(ChooseRoleComponent);
