import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminHomePageFAQ from '../../../components/HomePage/FAQ/AdminHomePageFAQ.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections, Meteor, LocalState } = context();
  const err = LocalState.get('ADMIN_HOMEPAGE_ERROR');

  if (Meteor.subscribe('adminGetHomePageData').ready()) {
    const homepageData = Collections.Admin.findOne({ type: 'homepage' });
    const faq = homepageData.data.faq;
    onData(null, { err, homepageData, faq });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  updateHomePage: actions.admin.updateHomePage,
  clearErrors: actions.admin.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AdminHomePageFAQ);
