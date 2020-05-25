import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import HomePage from '../components/HomePage.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections, Meteor } = context();
  const userIsLoggedIn = !!Meteor.userId();
  if (Meteor.subscribe('adminGetHomePageData').ready()) {
    const homepageData = Collections.Admin.findOne({ type: 'homepage' });
    onData(null, { homePageData: homepageData.data, userIsLoggedIn });
  }
  // return clearErrors;
};

export const depsMapper = (context, actions) => ({
  contactSubmit: actions.contact.contactSubmit,
  clearErrors: actions.contact.clearErrors,
  activeAccount: actions.contact.activeAccount,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(HomePage);
