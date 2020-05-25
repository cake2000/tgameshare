import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { withRouter } from 'react-router-dom';
import MessageActivity from '../components/MessageActivity.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, history, clearValue }, onData) => {
  const { Collections: { ChatSupport, Counts }, LocalState } = context();

  const userId = Meteor.userId();
  const userValue = LocalState.get('USER') || '';
  let totalUsers = 0;
  const userData = Meteor.user();

  if (userId) {
    if (Meteor.subscribe('chatSupport.getAllChatSupportCounter', userValue).ready()) {
      const counter = Counts.findOne(Meteor.userId());

      if (counter) {
        totalUsers = counter.countMessages;
      }
    }

    const isSupporter = Meteor.user() && Meteor.user().isSupporter();

    if (!isSupporter) {
      Meteor.subscribe('chatSupport.getByUserId');
    }
    const chatSupports = ChatSupport.find({}, { sort: { lastTimeAdded: -1 } }).fetch();

    onData(null, {
      chatSupports,
      totalUsers,
      userData
    });
  } else {
    history.push('/signin');
  }
  return clearValue;
};

export const depsMapper = (context, actions) => ({
  searchUser: actions.messageActivity.searchUser,
  setUserLimitAndSkip: actions.messageActivity.setUserLimitAndSkip,
  clearValue: actions.messageActivity.clearValue,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper),
  withRouter,
)(MessageActivity);
