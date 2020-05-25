import React from 'react';
import moment from 'moment';
import { convertToClientId } from './ChatHistory.jsx';

const ChatLine = ({
  _id, avatar = "https://via.placeholder.com/44", createdAt, createdBy, username, content
}) => (
  <div className="Chatline__container" id={convertToClientId(_id)}>
    <div className="Chatline__avatar"><img src={avatar} alt="" /></div>
    <div className="Chatline__wrapper">
      <div className="Chatline__title">
        <span className={
          `lesson_chat_history__created_by ${createdBy === Meteor.userId() && 'lesson_chat_history__created_by_me'}`
        }
        >
          {username}
        </span>
        <span className="lesson_chat_history__created_at">{moment(createdAt).format('MM/DD/YYYY hh:mm a')}</span>
      </div>
      <div className="lesson_chat_history__content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  </div>
);

export default ChatLine;
