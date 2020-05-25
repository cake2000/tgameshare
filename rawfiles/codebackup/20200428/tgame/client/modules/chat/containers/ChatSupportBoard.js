import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

import ChatSupportBoard from '../components/ChatSupportBoard.jsx';
import { checkIsProUser } from '../../../../lib/util';

export const composer = ({ context }, onData) => {
  const { Collections, Meteor } = context();
  const { ChatSupport, Message } = Collections;
  const handleChatSupport = Meteor.subscribe('changeSupport.getByUserId');
  let chatSupport;
  let messages = [];
  let isProfessionalUser = false;

  const handleCheckProUser = Meteor.subscribe('stripeCustomer.single');
  if (handleCheckProUser.ready()) {
    isProfessionalUser = checkIsProUser();
  }
  if (handleChatSupport.ready()) {
    chatSupport = ChatSupport.findOne({ userId: Meteor.userId() });
    if (chatSupport) {
      messages = Message.find(
        { chatSupportId: chatSupport._id },
        { sort: { createdAt: 1 } }
      ).fetch();
    }
  }

  const data = {
    loading: !handleChatSupport.ready() && !handleCheckProUser.ready(),
    chatSupport,
    messages,
    isProfessionalUser: true
  };
  onData(null, data);
};

export const depsMapper = (context, actions) => {
  return {
    markAsSeenMessage: actions.chat.markAsSeenMessageFromUser,
    createChatSupport: actions.chat.createChatSupport,
    addNewMessageFromUser: actions.chat.addNewMessageFromUser,
    context: () => context
  };
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ChatSupportBoard);
