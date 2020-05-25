import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChatHistory from '../../lessonpage/containers/ChatHistory';

class ChatBox extends Component {
  state = {
    limit: 20,
    skip: 0,
    loadMaxMessages: false,
    loadMoreMessages: false,
    scrollHeightChatBox: 0
  };

  componentDidMount() {
    const { scrollComponentId } = this.props;

    if (scrollComponentId) {
      document.getElementById(scrollComponentId).onscroll = this.handleScrollChatBox;
    }
  }

  componentWillReceiveProps(nextProps) {
    const { keyword, chatSupport } = this.props;

    if (nextProps.keyword !== keyword) {
      this.setState({ scrollHeightChatBox: 0, loadMaxMessages: false });
    }
    if ((!chatSupport && nextProps.chatSupport)
      || (nextProps.chatSupport && chatSupport && nextProps.chatSupport._id !== chatSupport._id)) {
      this.setState({
        loadMaxMessages: false,
        loadMoreMessages: false,
        limit: 20,
        skip: 0,
        scrollHeightChatBox: 0
      });
    }
  }

  handleScrollChatBox = () => {
    const { loadMaxMessages } = this.state;
    const { scrollComponentId } = this.props;
    const chatBoxElement = scrollComponentId ? document.getElementById(scrollComponentId) : this.chatBox;

    if (chatBoxElement && chatBoxElement.scrollTop === 0 && !loadMaxMessages) {
      this.setState(previousState => ({
        skip: previousState.skip + 20,
        loadMoreMessages: true,
        scrollHeightChatBox: chatBoxElement.scrollHeight
      }));
    }
  };

  loadMaximumMessages = () => {
    this.setState({ loadMaxMessages: true });
  };

  scrollToLoadingIconMessage = () => {
    const { scrollHeightChatBox } = this.state;
    const { scrollComponentId } = this.props;
    const chatBoxElement = scrollComponentId ? document.getElementById(scrollComponentId) : this.chatBox;

    if (chatBoxElement) {
      chatBoxElement.scrollTo(0, chatBoxElement.scrollHeight - scrollHeightChatBox);
    } else {
      const chatBox = document.getElementById('chatBoxHistory');
      chatBox.scrollTo(0, chatBox.scrollHeight - scrollHeightChatBox);
    }
    this.setState({ loadMoreMessages: false });
  };

  render() {
    const {
      chatSupport, keyword, scrollComponentId, isShowing
    } = this.props;
    const {
      limit, skip, loadMaxMessages, loadMoreMessages
    } = this.state;

    return (
      <div
        className={!scrollComponentId && 'message-activity__chat-history'}
        id="chatBoxHistory"
        ref={(e) => { this.chatBox = e; }}
        onScroll={this.handleScrollChatBox}
      >
        {
          chatSupport && (
            <ChatHistory
              keyword={keyword}
              isShowing={isShowing}
              chatSupport={chatSupport}
              limit={limit}
              skip={skip}
              loadMaxMessages={loadMaxMessages}
              loadMore={loadMoreMessages}
              loadMaximumMessages={this.loadMaximumMessages}
              scrollToLoadingIcon={this.scrollToLoadingIconMessage}
            />
          )
        }
      </div>
    );
  }
}

ChatBox.propTypes = {
  chatSupport: PropTypes.shape(),
  keyword: PropTypes.string,
  scrollComponentId: PropTypes.string,
  isShowing: PropTypes.bool
};

ChatBox.defaultProps = {
  chatSupport: null,
  keyword: '',
  scrollComponentId: null,
  isShowing: true
};

export default ChatBox;
