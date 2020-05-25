import React from 'react';
import NotificationItemWrapper from './NotificationItemWrapper.jsx';

const NotificationFinishTournament = ({ notification, viewResult, getKey }) => {
  const { message } = notification;

  return (
    <NotificationItemWrapper viewResult={viewResult} getKey={getKey}>
      <div className="noti-item__col-content">
        <div className="noti-item__content">
          <div className="noti-item__content__msg">
            {message}
          </div>
        </div>
      </div>
    </NotificationItemWrapper >
  );
};

export default NotificationFinishTournament;
