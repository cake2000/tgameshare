import React from 'react';

const NotificationItemContentInfo = ({ imgUrl, player, level, round }) => (
  <div className="noti-item__content__info">
    {imgUrl ? <img src={imgUrl} alt="Logo" /> : null}
    <div className="noti-item__content__info__level-info">
      {level}
    </div>
    <div className="noti-item__content__info__round-info">
      {round}
    </div>
    <div className="noti-item__content__info__player-info">
      {player}
    </div>
  </div>
);

export default NotificationItemContentInfo;
