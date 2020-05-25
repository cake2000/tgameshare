import React from 'react';
import Avatar from '../Avatar.jsx';

const NotificationItemWrapper = ({ children, className, isRead, viewResult, sender }) => {
  const classNameBuilder = (_className, _isRead) => {
    let cl = 'noti-item';
    if (_isRead) cl = `${cl} noti-item--read`;
    if (_className) cl = `${cl} ${_className}`;

    return cl;
  };
  return (
    <div
      aria-hidden="true"
      className={classNameBuilder(className, isRead)}
      // key={getKey}
      onClick={viewResult}
    >
      <div className="noti-item__col-avatar">
        { sender && sender.avatar && sender.avatar.url ?
          <Avatar className="noti-item__img" url={sender.avatar.url} alt={sender.username} /> :
          <Avatar className="noti-item__img" alt="User Avatar" />
        }
      </div>
      {children}
    </div>
  );
};

export default NotificationItemWrapper;
