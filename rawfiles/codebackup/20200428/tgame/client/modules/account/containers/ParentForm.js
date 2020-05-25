import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

import ParentForm from '../components/ParentForm.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ clearErrors }, onData) => {
  onData(null, {});
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  sendParentEmail: actions.account.sendParentEmail,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(ParentForm);
