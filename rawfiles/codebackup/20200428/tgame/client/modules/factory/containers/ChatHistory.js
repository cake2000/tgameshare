import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ChatHistory from '../components/ChatHistory.jsx';

export const composer = ({ context, keyword }, onData) => {
  const { Collections } = context();

  const userId = Meteor.userId();
  if (userId) {
    if (Meteor.subscribe('lessonChatHistory.getLessonChatHistory', userId, keyword).ready()) {
      const selector = {
        ownerId: userId
      };

      const messages = Collections.LessonChatHistory.find(selector, { sort: { createdAt: 1 } }).fetch();

      onData(null, {
        messages
      });
    }
  } else {
    onData(null, {});
  }
};

export const depsMapper = context => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(ChatHistory);
