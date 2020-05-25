import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _last from 'lodash/last';
import _isEmpty from 'lodash/isEmpty';
import _map from 'lodash/map';
import ChatLine from './ChatLine.jsx';

export const convertToClientId = id => `t${id}`;

class ChatHistory extends PureComponent {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape())
  }

  static defaultProps = {
    messages: []
  }

  componentDidUpdate(prevProps) {
    const { messages } = this.props;
    if (_get(prevProps, 'messages.length') < _get(messages, 'length') || this.isShowingfromHiddenState(prevProps)) {
      this.scrollToLatestMessage(messages);
    }
  }

  isShowingfromHiddenState = prevProps => (prevProps.isShowing === false) && (this.props.isShowing === true)

  scrollToMessageId = (_id) => {
    const latestMessageElement = document.querySelector(`#${convertToClientId(_id)}`);

    if (latestMessageElement) {
      latestMessageElement.scrollIntoView();
    }
  }

  scrollToLatestMessage = (messages) => {
    const latestMessage = _last(messages);
    if (latestMessage) {
      this.scrollToMessageId(latestMessage._id);
    }
  }

  renderChatHistoryItem = message => (
    <ChatLine {...message} key={message._id} />
  )

  render() {
    const { messages } = this.props;

    return (
      <div className="lesson_chat_history">
        {
          messages && messages.length > 0 ? _map(messages, this.renderChatHistoryItem)
            : <div className="lesson_chat_history__no_message">No messages</div>
        }
      </div>
    );
  }
}

export default ChatHistory;
