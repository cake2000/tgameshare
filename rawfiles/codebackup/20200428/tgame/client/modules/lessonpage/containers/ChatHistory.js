import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ChatHistory from '../components/ChatHistory.jsx';

export const composer = (
  {
    context, keyword, chatSupport
  }, onData
) => {
  const { Collections } = context();
  const { LessonChatHistory, Counts } = Collections;

  const userId = Meteor.userId();
  if (userId && chatSupport ) {
    let messagesLength = 0;


    if (chatSupport._id && Meteor.subscribe('lessonChatHistory.getAllMessagesCounter', chatSupport._id, keyword).ready()) {
      const counter = Counts.findOne(chatSupport._id);

      if (counter) {
        messagesLength = counter.countMessages;
      }
    }
    const selector = {
      chatSupportId: chatSupport._id
    };

    if (keyword && keyword.trim() !== '') {
      selector.content = { $regex: new RegExp(keyword, 'i') };
    }
    const messages = LessonChatHistory.find(selector, { sort: { createdAt: 1 } }).fetch();
    onData(null, {
      messages,
      messagesLength,
    });
  } else {
    onData(null, {});
  }
};

export const depsMapper = (context, actions) => ({
  markAsSeenMessageFromUser: actions.chat.markAsSeenMessageFromUser,
  markAsSeenMessageFromSupporter: actions.chat.markAsSeenMessageFromSupporter,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper),
)(ChatHistory);
