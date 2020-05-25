import React from 'react';

import { Redirect } from 'react-router-dom';
import { ACTION_TYPE_SUPPORT_MESSAGE } from '../../../../lib/enum';
import TimeCalendar from './TimeCalendar.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';



const MessageItem = ({ messageData }) => {
  const { message, createdAt, actionType } = messageData;
  const isYou = actionType === ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT;
  return (
    <div className={`chatHistory__List__Item ${actionType} topLevelTR`}>
      <div key={`td-${actionType} ${createdAt}`}>
        <div key={`div-${actionType} ${createdAt}`} className={`chatHistory__List__Item__Line chatHistory__List__Item__Line--${actionType}`}>
          {
            (actionType === ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT) ?
              <div className="chatHistory__List__Item__Line__User">
                <img className="image-chat-avatar" src="/img_v2/ProfileIcon.png" alt="user Chat" width="40px" />
                <span>User</span>
              </div> :
              <div className="chatHistory__List__Item__Line__User">
                <img className="image-chat-avatar" src="/images/userRobotChat.jpg" alt="user Chat" width="40px" />
                <span>Supporter</span>
              </div>
          }
          <div className="chatHistory__List__Item__Line__Content">
            <div className={`bubble you ${isYou ? 'isUser' : ''}`} dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        </div>
      </div>
      <time>
        <TimeCalendar datetime={createdAt} />
      </time>
    </div>
  );
};


class ChatConversationDetail extends React.Component {

  componentDidMount() {
    const { loading, messages } = this.props;

    // Should check only loading = false and messages have length
    if (!loading && Array.isArray(messages) && messages.length) {
      this.scrollToBottom();
      // Mark seen with this converastion
      this.markAsSeenMessage();
    }
  }
  componentDidUpdate(prevProps) {
    const { loading, messages } = this.props;
    if (!loading && messages.length !== prevProps.messages.length) {
      this.scrollToBottom();
      // Mark seen with this converastion
      this.markAsSeenMessage();
    }
  }
  scrollToBottom = () => {
    this.lastMessage.scrollIntoView({ behavior: 'smooth' });
  }

  markAsSeenMessage = () => {
    const { markAsSeenMessage, chatSupport } = this.props;
    if (chatSupport) {
      markAsSeenMessage(chatSupport._id);
    }
  }

  toggleSending = isSending => this.setState({
    isSending,
  });

  handleSendMessage = () => {
    const { chatSupport, addNewMessageFromSupporter } = this.props;
    if (chatSupport && this.inputMessage && this.inputMessage.value.trim()) {
      const message = this.inputMessage.value.trim();
      this.toggleSending(true);
      addNewMessageFromSupporter(message, chatSupport._id, (error) => {
        if (error) {
          console.log('error', error);
        } else this.inputMessage.value = '';
        this.toggleSending(false);
      });
    }
  }
  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSendMessage();
    }
  }
  createNewChatSupport = () => {
    this.props.createChatSupport();
  }

  handleClickSendButton = (e) => {
    e.preventDefault();
    this.handleSendMessage();
  }
  render() {
    const { messages, chatSupport, loading } = this.props;
    const username = chatSupport && chatSupport.user && chatSupport.user.username;
    if (loading) {
      return (
        <LoadingPage />
      );
    }
    // Should redirect to admin if chatSupport is not found (invalid)
    if (!loading && !chatSupport) {
      return (
        <Redirect to="/admin" />
      );
    }
    return (
      <div className="admin-chat-support">
        <div className="admin-cards">
          <div className="admin-title">Chat support detail</div>
          <div className="admin-cards__content">
            <div className="buildmyAI buildmyAI--content">
              <div className="chatHistoryBlock">
                <div className="chatHistoryTitle ">Chat support {username ? `(${username})` : ''}</div>
                <div className="chatHistoryScroll" id="chatHistoryScroll">
                  <div className="chatHistory">
                    <div className="chatHistory__List">
                      {
                        messages.map(messageData => (<MessageItem
                          key={messageData._id}
                          messageData={messageData}
                        />))
                      }
                    </div>
                    <div ref={(lastMessage) => { this.lastMessage = lastMessage; }} />
                  </div>
                </div>
                <div id="chatHistoryAction">
                  <div className="chatHistoryForm">
                    <textarea ref={(input) => { this.inputMessage = input; }} onKeyPress={this.handleKeyPress} id="inputtext" placeholder="Type message..." />
                    <button className="btn sendChatButton" onClick={this.handleClickSendButton}>
                      <img src="/images/icon-up-send.svg" alt="send data" width="20px" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ChatConversationDetail;
