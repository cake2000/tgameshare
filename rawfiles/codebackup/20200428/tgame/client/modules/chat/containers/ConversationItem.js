import { composeAll, composeWithTracker, useDeps } from 'mantra-core';
import ConversationItem from '../components/ConversationItem.jsx';

export const composer = ({ context, chatSupport }, onData) => {
  const { Collections, Meteor } = context();
  const { LessonChatHistory } = Collections;
  const conversationData = Object.assign({}, chatSupport);
  const handleInfoChatSupport = Meteor.subscribe('chatSupport.getInfoChatSupport', conversationData._id);

  if (handleInfoChatSupport.ready()) {
    conversationData.user = Meteor.users.findOne({ _id: conversationData.userId });
    // Get last message in this chat support
    conversationData.lastMessage = LessonChatHistory.findOne(
      { chatSupportId: chatSupport._id },
      {
        sort: {
          createdAt: -1
        }
      }
    );
  }

  const data = {
    conversation: conversationData,
    loading: !handleInfoChatSupport.ready()
  };
  onData(null, data);
};

export const depsMapper = (context) => {
  return {
    context: () => context
  };
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ConversationItem);
