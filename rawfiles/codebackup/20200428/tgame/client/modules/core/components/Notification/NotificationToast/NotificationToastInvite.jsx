import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import NotificationItemWrapper from '../NotificationItemWrapper.jsx';
import NotificationItemContentInfo from '../NotificationItemContentInfo.jsx';

class NotificationToastInvite extends React.Component {
  static propTypes = {
    notification: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    sender: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    game: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    accept: PropTypes.func.isRequired,
    decline: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    notification: null,
    sender: null,
    game: null
  };

  render() {
    const { notification, accept, decline, history, game, sender } = this.props;
    const handleClickAccept = () => {
      accept(notification.entityId, notification._id, history);
    };
    const handleClickDecline = () => {
      decline(notification.entityId, notification._id, history);
    };
    const getLevelInfo = (_game) => {
      // return [...new Array(_game.teamNumber)].map(() => _game.teamSize).join`v`;
      return `${notification.teamSize}v${notification.teamSize}`;
    };

    // debugger; // bbbb

    return (
      <div
        className="noti-dropdown"
        id="noti-dropdown"
      >
        <NotificationItemWrapper
          isRead={false}
          sender={sender}
        >
          <div className="noti-item__col-content">
            <div className="noti-item__content">
              {sender && game ?
                <div className="noti-item__content__msg">
                  <b>{sender.username}</b>{` ${notification.message} `}<b>{game.title}</b> game
                </div>
                :
                <div className="noti-item__content__msg">
                  Loading...
                </div>
              }
              {game ?
                <NotificationItemContentInfo
                  imgUrl={game.imageUrl}
                  player={getLevelInfo(game)}
                  level={notification.gameLevel}
                />
                : null}
            </div>
          </div>
          <div className="noti-item__col-button-action">
            <div className="noti-item__btn">
              <button
                className="noti-item__btn--accept"
                onClick={handleClickAccept}
              >
                Accept
              </button>
              <button
                className="noti-item__btn--decine"
                onClick={handleClickDecline}
              >
                X
              </button>
            </div>
          </div>
        </NotificationItemWrapper>
      </div>
    );
  }
}


export default withRouter(NotificationToastInvite);

