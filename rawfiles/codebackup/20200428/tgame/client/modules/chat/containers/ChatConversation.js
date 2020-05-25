
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

import ChatConversation from '../components/ChatConversation.jsx';

export const composer = ({ context, currentUser }, onData) => {
  const { Collections, Meteor } = context();
  const { ChatSupport } = Collections;
  let conversations = [];
  const handleConversation = Meteor.subscribe('chatSupport.getConversation');
  const sortType = {
    unReadCount: -1,
    lastTimeAdded: -1,
  };
  if (handleConversation.ready()) {
    conversations = ChatSupport.find({ }, { sort: sortType }).fetch();
  }
  const data = {
    conversations,
    loading: !handleConversation.ready(),
  };
  onData(null, data);
};

export const depsMapper = (context, actions) => {
  return {
    context: () => context
  };
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ChatConversation);
