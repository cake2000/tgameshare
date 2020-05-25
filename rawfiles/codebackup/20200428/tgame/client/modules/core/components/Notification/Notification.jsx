import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import NotificationInviteItem from './NotificationInviteItem.jsx';
import NotificationTournamentItem from './NotificationTournamentItem.jsx';
import NotificationItemViewAll from './NotificationItemViewAll.jsx';
import NotificationFinishTournament from './NotificationFinishTournament.jsx';
import { NOTIFICATION, NOTIFICATION_ACTION } from '../../../../../lib/enum';

export default class Notification extends Component {
  renderItem = (props) => {
    const {
      notification, game, gameRoom,
      accept, decline, history,
      joinRoom, round, cancel, key,
      viewResult, user, tournament
    } = props;
    switch (notification.entityType) {
      case NOTIFICATION.INVITE_TO_PLAY_GAME:
        return (
          <NotificationInviteItem
            notification={notification}
            game={game}
            gameRoom={gameRoom}
            sender={user}
            accept={() => accept(notification.entityId, notification._id, history)}
            decline={() => decline(notification.entityId, notification._id)}
            getKey={key}
            key={key}
          />
        );
      case NOTIFICATION.TOURNAMENT_INVITE:
        if (round) {
          return (
            <NotificationTournamentItem
              notification={notification}
              tournamentInfo={tournament}
              roundInfo={round}
              joinRoom={() =>
                joinRoom(round.pairData, round.roundData._id, notification._id, history)
              }
              cancel={() => cancel(round.pairData, notification._id)}
              viewResult={() =>
                viewResult(round.roundData.sectionId, notification._id, NOTIFICATION_ACTION.DELETE, history)
              }
              getKey={key}
              key={key}
            />
          );
        }
        return null;
      case NOTIFICATION.FINISH_TOURNAMENT:
        return (
          <NotificationFinishTournament
            notification={notification}
            viewResult={() =>
              viewResult(notification.entityId, notification._id, NOTIFICATION_ACTION.SEEN, history)
            }
            getKey={key}
            key={key}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const {
      notifications, gameList, gameRoomList,
      accept, decline, joinRoom, history,
      isNotiShow, rounds, cancel,
      viewResult, userList, tournamentInfoList
    } = this.props;

    return (
      <div
        className={`noti-dropdown ${isNotiShow ? '' : 'hide'}`}
        id="noti-dropdown"
      >
        {
          notifications.length === 0 ?
            <div className="noti__no-item">
              {'You don\'t have any notifications'}
            </div>
            : null
        }
        {
          _.map(notifications.slice(0, 5), (notification, key) => {
            const round = rounds[key];
            const user = userList.find(e =>
              notification.sender &&
              notification.sender.userId &&
              e._id === notification.sender.userId
            );

            let gameRoom;
            let game;
            let tournament;

            switch (notification.entityType) {
              case NOTIFICATION.INVITE_TO_PLAY_GAME: {
                gameRoom = gameRoomList.find(e => e._id === notification.entityId);
                if (gameRoom) {
                  game = gameList.find(e => e._id === gameRoom.gameId);
                }
                break;
              }
              case NOTIFICATION.TOURNAMENT_INVITE: {
                tournament = tournamentInfoList.find(e => e.id === notification.entityId);
                break;
              }
              default:
                break;
            }

            return (
              this.renderItem({
                notification,
                accept,
                decline,
                joinRoom,
                history,
                round,
                cancel,
                key,
                game,
                gameRoom,
                viewResult,
                tournament,
                user
              })
            );
          })
        }
        {
          notifications.length > 5 ?
            <NotificationItemViewAll />
            : null
        }
      </div>
    );
  }
}
