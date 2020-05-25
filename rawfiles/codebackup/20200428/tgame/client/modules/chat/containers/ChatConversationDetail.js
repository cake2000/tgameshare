
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

import ChatConversationDetail from '../components/ChatConversationDetail.jsx';

export const composer = ({ context, match }, onData) => {
  const { Collections, Meteor } = context();
  const { chatSupportId } = match.params;
  const { ChatSupport, Message } = Collections;
  const handleChatSupport = Meteor.subscribe('changeSupport.getById', chatSupportId);
  let chatSupport;
  let messages = [];
  if (handleChatSupport.ready()) {
    chatSupport = ChatSupport.findOne({ _id: chatSupportId });
    if (chatSupport) {
      chatSupport.user = Meteor.users.findOne({ _id: chatSupport.userId });
      messages = Message.find(
        { chatSupportId },
        { sort: { createdAt: 1 } }
      ).fetch();
    }
  }

  const data = {
    loading: !handleChatSupport.ready(),
    chatSupport,
    messages
  };
  onData(null, data);
};

export const depsMapper = (context, actions) => {
  return {
    markAsSeenMessage: actions.chat.markAsSeenMessageFromSupporter,
    addNewMessageFromSupporter: actions.chat.addNewMessageFromSupporter,
    context: () => context
  };
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ChatConversationDetail);
