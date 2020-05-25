/* globals Roles */
import React from 'react';
import { Redirect } from 'react-router-dom';

import LoadingPage from '../../loading/components/loadingPage.jsx';
import Banner from '../../core/components/Banner.jsx';
import { ACTION_TYPE_SUPPORT_MESSAGE, ROLES } from '../../../../lib/enum';
import TimeCalendar from './TimeCalendar.jsx';

const MessageItem = ({ messageData }) => {
  const {
    message, createdAt, createdBy, actionType
  } = messageData;
  const isYou = createdBy === Meteor.userId();
  return (
    <div className={`chatHistory__List__Item ${actionType} topLevelTR`}>
      <div key={`td-${actionType} ${createdAt}`}>
        <div key={`div-${actionType} ${createdAt}`} className={`chatHistory__List__Item__Line chatHistory__List__Item__Line--${actionType}`}>
          {
            (actionType === ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT && isYou)
              ? (
                <div className="chatHistory__List__Item__Line__User">
                  <img className="image-chat-avatar" src="/img_v2/ProfileIcon.png" alt="user Chat" width="40px" />
                  <span>You</span>
                </div>
              )
              : (
                <div className="chatHistory__List__Item__Line__User">
                  <img className="image-chat-avatar" src="/images/userRobotChat.jpg" alt="user Chat" width="40px" />
                  <span>Supporter</span>
                </div>
              )
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

class ChatSupportBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSending: false
    };
  }

  componentWillMount() {
    const { loading, chatSupport } = this.props;
    if (!loading && !chatSupport) {
      // Should create change support if no have it yet
      this.createNewChatSupport();
    }
  }

  componentDidMount() {
    const { loading, messages } = this.props;

    // Should check only loading = false and messages have length
    if (!loading && Array.isArray(messages) && messages.length) {
      this.scrollToBottom();
      // Mark seen with this converastion
      this.markAsSeenMessage();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { loading } = this.props;
    if (!nextProps.loading && !nextProps.chatSupport && loading) {
      // Should create change support if no have it yet
      this.createNewChatSupport();
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

  createNewChatSupport = () => {
    this.props.createChatSupport();
  }

  toggleSending = isSending => this.setState({
    isSending
  });

  handleSendMessage = () => {
    const { chatSupport, addNewMessageFromUser } = this.props;
    if (chatSupport && this.inputMessage && this.inputMessage.value.trim()) {
      const message = this.inputMessage.value.trim();
      this.toggleSending(true);
      addNewMessageFromUser(message, chatSupport._id, (error) => {
        if (error) {
          console.log('error', error);
        } else this.inputMessage.value = '';
        this.toggleSending(false);
      });
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

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSendMessage();
    }
  }

  handleClickSendButton = (e) => {
    e.preventDefault();
    this.handleSendMessage();
  }

  render () {
    const { messages, loading, isProfessionalUser } = this.props;
    // if ((!Roles.userIsInRole(Meteor.userId(), ROLES.AI))
    //     && (!Roles.userIsInRole(Meteor.userId(), ROLES.MANUAL))) {
    //   return (
    //     <Redirect to="/" />
    //   );
    // }
    if (loading) {
      return (
        <LoadingPage />
      );
    }
    // if (!loading && !isProfessionalUser) {
    //   return (
    //     <Redirect to="/" />
    //   );
    // }
    const { isSending } = this.state;

    return (
      <div className="tg-page tg-page--chatSupport">
        <Banner title="Chat support" />
        <div className="tg-page__content tg-page__content--chatSupport">
          <div className="tg-page__content__block tg-container tg-page__content__block--conversation">
            <div className="buildmyAI buildmyAI--content">
              <div className="chatHistoryBlock">
                <div className="chatHistoryTitle ">Chat support</div>
                <div className="chatHistoryScroll" id="chatHistoryScroll">
                  <div className="chatHistory">
                    <div className="chatHistory__List">
                      {
                        messages.map(messageData => <MessageItem key={messageData._id} messageData={messageData} />)
                      }
                    </div>
                    <div ref={(lastMessage) => { this.lastMessage = lastMessage; }} />
                  </div>
                </div>
                <div id="chatHistoryAction">
                  <div className="chatHistoryForm">
                    <textarea ref={(input) => { this.inputMessage = input; }} id="inputtext" onKeyPress={this.handleKeyPress} placeholder="Type message..." />
                    <button type="button" className="btn sendChatButton" onClick={this.handleClickSendButton} disabled={isSending}>
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

export default ChatSupportBoard;
