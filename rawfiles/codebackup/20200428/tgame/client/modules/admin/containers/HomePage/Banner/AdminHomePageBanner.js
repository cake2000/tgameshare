import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminHomePageBanner from '../../../components/HomePage/Banner/AdminHomePageBanner.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections, Meteor, LocalState } = context();
  const err = LocalState.get('ADMIN_HOMEPAGE_ERROR');

  if (Meteor.subscribe('adminGetHomePageData').ready()) {
    const homepageData = Collections.Admin.findOne({ type: 'homepage' });
    const banner = homepageData.data.banner;
    onData(null, { err, homepageData, banner });
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
)(AdminHomePageBanner);
