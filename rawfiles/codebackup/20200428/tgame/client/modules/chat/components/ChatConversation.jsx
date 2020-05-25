import React from 'react';

import LoadingPage from '../../loading/components/loadingPage.jsx';
import ConversationItem from '../containers/ConversationItem.js';


class ChatConversation extends React.Component {

  render () {
    const { conversations, loading } = this.props;
    if (loading) {
      return (
        <LoadingPage />
      );
    }
    return (
      <div className="admin-chat-support">
        <div className="admin-cards">
          <div className="admin-title">Chat support</div>
          <div className="admin-cards__content">
            <div className="chatHistoryTitle ">Conversation</div>
            <div className="conversations">
              <div className="conversation">
                <div className="conversation__user">
                  User
                </div>
                <div className="conversation__last-message">
                  Last message
                </div>
                <div className="conversation__time">
                  Last active time
                </div>
                <div className="conversation__unRead">
                  Unread
                </div>
              </div>
              { conversations.map(conversation => (<ConversationItem
                key={conversation._id}
                conversation={conversation}
              />))
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChatConversation;
