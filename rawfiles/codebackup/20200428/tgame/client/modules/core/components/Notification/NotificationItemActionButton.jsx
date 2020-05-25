import React from 'react';

const NotificationItemActionButton = ({ accept, decline, countdown, msg }) => {
  const countDownFormat = (count) => {
    let second = count % 60;
    let minute = parseInt(count / 60, 10);

    if (count < 60) {
      if (second < 10) {
        return `0${second}s`;
      }
      return `${second}s`;
    }

    if (second < 10) second = `0${second}`;
    if (minute < 10) minute = `0${minute}`;

    return `${minute}:${second}`;
  };

  if (countdown !== 0) {
    return (
      <div className="noti-item__col-button-action">
        <div className="noti-item__btn">
          {
            accept ?
              <button
                className="noti-item__btn--accept"
                onClick={accept}
              >
                {msg.accept}
              </button>
              : null
          }
          {
            decline ?
              <button
                className="noti-item__btn--decine"
                onClick={decline}
              >
                {msg.decline}
              </button>
              : null
          }
        </div>
        {
          countdown ?
            <div className="noti-item__countdown">
              Time left: {countDownFormat(countdown)}
            </div>
            : null
        }
      </div>
    );
  }
  return (
    <div className="noti-item__col-button-action">
      <div className="noti-item__btn">
        <button
          className="noti-item__btn--info"
        >
          {msg.info}
        </button>
      </div>
    </div>
  );
};

export default NotificationItemActionButton;
