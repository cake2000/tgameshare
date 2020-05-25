import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import LessonChatEditor from '../../lessonpage/components/LessonChatEditor.jsx';
import SearchBox from '../../lessonpage/components/SearchBox.jsx';
import ConversationItem from '../../chat/containers/ConversationItem';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import ChatBox from './ChatBox.jsx';

class MessageActivity extends Component {
  state = {
    keyword: '',
    limitUsers: 16,
    skipUsers: 0,
    chatSupport: null,
    loadMaxUsers: false,
    isLoading: true,
    isInitialized: false
  };

  _isMounted = false;

  subscriptions = [];

  componentWillMount() {
    if (Meteor.user() && Meteor.user().isSupporter()) {
      const { limitUsers, skipUsers } = this.state;

      this.loadUserList(limitUsers, skipUsers);
      this.setState({ isInitialized: true });
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillReceiveProps() {
    const { userData } = this.props;
    const { isInitialized } = this.state;

    if (!isInitialized && JSON.stringify(Meteor.user()) !== JSON.stringify(userData) && Meteor.user().isSupporter()) {
      const { limitUsers, skipUsers } = this.state;

      this.loadUserList(limitUsers, skipUsers);
    }
  }

  componentDidUpdate(prevProps) {
    const { totalUsers, chatSupports } = this.props;
    const { loadMaxUsers, chatSupport, isLoading } = this.state;

    if (!isLoading && chatSupports.length === totalUsers && !loadMaxUsers && (chatSupports.length !== prevProps.chatSupports.length || totalUsers !== prevProps.totalUsers)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ loadMaxUsers: true });
    }
    const chatSupportData = chatSupport ? chatSupports.find(chat => chat._id === chatSupport._id) : null;

    if ((!chatSupport && chatSupports.length > 0)
      || (chatSupport && !chatSupportData || (chatSupport && chatSupportData && JSON.stringify(chatSupport) !== JSON.stringify(chatSupportData)))) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ chatSupport: chatSupportData || chatSupports[0] });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.subscriptions.map(subscription => subscription.stop());
  }

  handleKeywordChange = value => this.setState({ keyword: value });

  handleFilterUser = (value) => {
    const { searchUser } = this.props;
    const { limitUsers } = this.state;

    this.setState({
      loadMaxUsers: false,
      skipUsers: 0,
      chatSupport: null
    });
    searchUser(value, 0);
    this.clearOldSubscription = true;
    this.subscriptions.map(subscription => subscription.stop());
    this.clearOldSubscription = false;
    this.loadUserList(limitUsers, 0, value);
  };

  renderChatBox = () => {
    const {
      keyword, chatSupport
    } = this.state;

    return (
      <div className="tg-page__container tg-tutorial__container" style={{ position: 'relative', marginBottom: 0 }}>
        <div className="message-activity__search-box">
          <h2>Q&A</h2>
          <SearchBox onChange={this.handleKeywordChange} />
        </div>
        <ChatBox chatSupport={chatSupport} keyword={keyword} />
        {/* <div className="message-activity__chat-editor">
          <LessonChatEditor messageActivity chatSupport={chatSupport} />
        </div> */}
      </div>
    );
  };

  renderChatSupportItem = (conversation) => {
    const { chatSupport } = this.state;

    return (
      <ConversationItem
        key={conversation._id}
        chatSupport={conversation}
        selected={chatSupport && conversation._id === chatSupport._id}
        selectChatSupport={this.selectConversation}
      />
    );
  };

  selectConversation = (chatSupportValue) => {
    const { chatSupport } = this.props;

    if (chatSupport && chatSupport._id === chatSupportValue._id) return;
    this.setState({
      chatSupport: chatSupportValue
    });
  };

  handleScrollUserList = () => {
    if (this.userList) {
      const clientHeight = this.userList.getBoundingClientRect().height;
      const { scrollHeight, scrollTop } = this.userList;
      const { limitUsers, loadMaxUsers } = this.state;
      const { chatSupports } = this.props;

      if (scrollTop + clientHeight >= scrollHeight && !loadMaxUsers) {
        this.setState({
          skipUsers: chatSupports.length
        });
        this.loadUserList(limitUsers, chatSupports.length);
      }
    }
  };

  loadUserList = (limit, skip, userValue = '') => {
    this.setState({ isLoading: true });
    this.subscriptions.push(Meteor.subscribe('chatSupport.getConversation', { userValue, limit, skip }, {
      onReady: () => {
        const { initialized } = this.state;

        if (!this._isMounted) return false;
        if (!initialized) {
          this.setState({ initialized: true });
        }
        this.setState({ isLoading: false });
        return true;
      },
      onStop: () => {
        if (this._isMounted && !this.clearOldSubscription) {
          this.loadUserList(limit, skip, userValue);
        }
      }
    }));
  };

  render() {
    const isSupporter = Meteor.user() && Meteor.user().isSupporter();
    const { loadMaxUsers } = this.state;
    const { chatSupports } = this.props;

    return (
      <div className="tg-page tg-page--general">
        {
          isSupporter ? (
            <div className="conversation-container">
              <div
                className="conversation-list"
                ref={(e) => { this.userList = e; }}
                onScroll={this.handleScrollUserList}
              >
                <SearchBox onChange={this.handleFilterUser} />
                {
                  chatSupports.map(this.renderChatSupportItem)
                }
                {
                  !loadMaxUsers && chatSupports.length > 0 && (
                    <LoadingIcon stroke="darkgray" height="50px" />
                  )
                }
              </div>
              {this.renderChatBox()}
            </div>
          ) : (this.renderChatBox())
        }
      </div>
    );
  }
}

MessageActivity.propTypes = {
  chatSupports: PropTypes.arrayOf(PropTypes.shape()),
  searchUser: PropTypes.func.isRequired,
  totalUsers: PropTypes.number.isRequired,
  userData: PropTypes.shape()
};

MessageActivity.defaultProps = {
  chatSupports: [],
  userData: null
};

export default MessageActivity;
