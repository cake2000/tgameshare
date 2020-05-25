import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../../core/components/Avatar.jsx';
import TimeCalendar from './TimeCalendar.jsx';

const ConversationItem = (props) => {
  const {
    conversation, loading, selectChatSupport, selected, chatSupport
  } = props;
  if (loading) return null;

  const {
    user = {}, lastMessage, lastTimeAdded, unReadCount
  } = conversation;
  return (
    <div
      className={`conversation ${selected && 'selected'}`}
      onClick={() => selectChatSupport(chatSupport)}
      role="presentation"
    >
      <div className="conversation__user">
        <Avatar url={user.avatar && user.avatar.url} />
        {
          unReadCount !== 0 && (
            <div className="conversation__unRead">
              <number className="number">{unReadCount > 99 ? 99 : unReadCount}</number>
            </div>
          )
        }
        <div className="conversation__user--wrapper">
          <div className="conversation__user--wrapper__name">{user.username}</div>
          <div
            className="conversation__user--wrapper__last-message"
            dangerouslySetInnerHTML={{ __html: lastMessage && lastMessage.content}}
          />
        </div>
      </div>
      <div className="conversation__time">
        <div>
          <div><TimeCalendar datetime={lastTimeAdded} /></div>
        </div>
      </div>
    </div>
  );
};

ConversationItem.propTypes = {
  conversation: PropTypes.shape().isRequired,
  chatSupport: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
  selectChatSupport: PropTypes.func.isRequired
};

export default ConversationItem;
