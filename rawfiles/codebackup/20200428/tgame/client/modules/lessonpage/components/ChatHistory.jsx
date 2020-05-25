import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _last from 'lodash/last';
import _map from 'lodash/map';
import ChatLine from './ChatLine.jsx';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

export const convertToClientId = id => `t${id}`;

class ChatHistory extends PureComponent {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape()),
    markAsSeenMessageFromUser: PropTypes.func.isRequired,
    markAsSeenMessageFromSupporter: PropTypes.func.isRequired,
    chatSupport: PropTypes.shape(),
    loadMaxMessages: PropTypes.bool.isRequired,
    messagesLength: PropTypes.number,
    loadMaximumMessages: PropTypes.func.isRequired,
    loadMore: PropTypes.bool.isRequired,
    scrollToLoadingIcon: PropTypes.func.isRequired,
    limit: PropTypes.number.isRequired,
    skip: PropTypes.number.isRequired,
    keyword: PropTypes.string,
    isShowing: PropTypes.bool.isRequired
  };

  static defaultProps = {
    messages: [],
    chatSupport: {},
    messagesLength: 0,
    keyword: ''
  };

  state = {
    isLoading: true,
    isLoadedMore: false,
    initialized: false
  };

  _isMounted = false;

  subscriptions = {};

  componentWillMount() {
    const { chatSupport, limit, skip } = this.props;

    if (chatSupport) {
      this.getChatHistory(chatSupport._id, limit, skip);
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    const { chatSupport } = this.props;

    this.subscriptions[chatSupport._id].map(subscription => subscription.stop());
  }

  componentWillReceiveProps(nextProps) {
    const {
      chatSupport, keyword, limit, skip, isShowing, messages
    } = this.props;

    if (chatSupport._id !== nextProps.chatSupport._id) {
      this.getChatHistory(nextProps.chatSupport._id, nextProps.limit, nextProps.skip, '');
      this.clearOldSubscription = true;
      this.subscriptions[chatSupport._id].map(subscription => subscription.stop());
      this.clearOldSubscription = false;
    }
    if (keyword !== nextProps.keyword) {
      this.getChatHistory(chatSupport._id, limit, skip, nextProps.keyword);
    }
    if (!isShowing && nextProps.isShowing) {
      this.scrollToLatestMessage(messages);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      messages, markAsSeenMessageFromUser, markAsSeenMessageFromSupporter,
      chatSupport, messagesLength, loadMaximumMessages, loadMore,
      scrollToLoadingIcon, limit, skip, isShowing
    } = this.props;
    const { isLoading } = this.state;
    const { isLoadedMore } = prevState;

    if (JSON.stringify(prevProps.messages[prevProps.messages.length - 1]) !== JSON.stringify(messages[messages.length - 1])
    || JSON.stringify(prevProps.messages[0]) !== JSON.stringify(messages[0]) && isShowing) {
      if (Meteor.user().isSupporter()) {
        markAsSeenMessageFromSupporter(chatSupport._id);
      } else {
        markAsSeenMessageFromUser(chatSupport._id);
      }
      this.scrollToLatestMessage(messages);
    }
    if ((messages.length !== prevProps.messages.length || messagesLength !== prevProps.messagesLength) && messages.length === messagesLength && chatSupport._id === prevProps.chatSupport._id) {
      loadMaximumMessages();
    }
    if (!isLoading && loadMore) {
      this.getChatHistory(chatSupport._id, limit, skip);
      scrollToLoadingIcon();
    }
    if (!isLoading && isLoadedMore) {
      scrollToLoadingIcon();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ isLoadedMore: false });
    }
  }

  getChatHistory = (chatSupportId, limit, skip, keyword = '') => {
    this.setState({ isLoading: true });
    if (!this.subscriptions[chatSupportId]) {
      this.subscriptions[chatSupportId] = [];
    }
    this.subscriptions[chatSupportId].push(Meteor.subscribe('lessonChatHistory.getLessonChatHistory', chatSupportId, keyword, limit, skip, {
      onReady: () => {
        const { initialized } = this.state;

        if (!this._isMounted) return false;
        const isLoadedMore = skip > 0;
        if (!initialized) {
          this.setState({ initialized: true });
        }
        this.setState({ isLoading: false, isLoadedMore });
        return true;
      },
      onStop: () => {
        if (this._isMounted && !this.clearOldSubscription) {
          this.getChatHistory(chatSupportId, limit, skip, keyword);
        }
      }
    }));
  };

  scrollToMessageId = (_id) => {
    const latestMessageElement = document.querySelector(`#${convertToClientId(_id)}`);

    if (latestMessageElement) {
      latestMessageElement.scrollIntoView();
    }
  };

  scrollToLatestMessage = (messages) => {
    const latestMessage = _last(messages);
    if (latestMessage) {
      this.scrollToMessageId(latestMessage._id);
    }
  };

  renderChatHistoryItem = message => (
    <ChatLine {...message} key={message._id} />
  );

  render() {
    const { messages, loadMaxMessages } = this.props;

    return (
      <div className="lesson_chat_history">
        {
          !loadMaxMessages && (
            <LoadingIcon stroke="darkgray" height="50px" />
          )
        }
        {
          messages && messages.length > 0 ? _map(messages, this.renderChatHistoryItem)
            : <div className="lesson_chat_history__no_message">No messages</div>
        }
      </div>
    );
  }
}

export default ChatHistory;
