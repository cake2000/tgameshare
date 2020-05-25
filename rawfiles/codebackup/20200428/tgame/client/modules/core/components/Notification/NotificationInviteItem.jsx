import React from 'react';
import NotificationItemWrapper from './NotificationItemWrapper.jsx';
import NotificationItemContentInfo from './NotificationItemContentInfo.jsx';
import NotificationItemActionButton from './NotificationItemActionButton.jsx';

const NotificationInviteItem = ({ notification, accept, decline, game, gameRoom, sender, getKey }) => {
  const { message, actionOnEntity } = notification;
  const { countdown } = actionOnEntity;
  const getLevelInfo = (_game) => {
    return [...new Array(_game.teamNumber)].map(() => _game.teamSize).join`v`;
  };

  return (
    <NotificationItemWrapper
      isRead={actionOnEntity.countdown === 0}
      getKey={getKey}
      sender={sender}
    >
      <div className="noti-item__col-content">
        <div className="noti-item__content">
          {sender && game ?
            <div className="noti-item__content__msg">
              <b>{sender.username}</b>{` ${message} `}<b>{game.title}</b> game
            </div>
            :
            <div className="noti-item__content__msg">
              Loading...
            </div>
          }
          {game && gameRoom ?
            <NotificationItemContentInfo
              imgUrl={game.imageUrl}
              player={getLevelInfo(game)}
              level={gameRoom.level}
            />
            : null}
        </div>
      </div>
      <NotificationItemActionButton
        accept={accept}
        decline={decline}
        countdown={countdown}
        msg={{
          accept: 'Accept',
          decline: 'X',
          info: 'Ended'
        }}
      />
    </NotificationItemWrapper >
  );
};

export default NotificationInviteItem;
