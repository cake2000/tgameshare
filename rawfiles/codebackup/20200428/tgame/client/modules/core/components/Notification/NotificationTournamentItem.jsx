import React from 'react';
import { MESSAGES, TIMES } from '../../../../../lib/const';
import NotificationItemWrapper from './NotificationItemWrapper.jsx';
import NotificationItemContentInfo from './NotificationItemContentInfo.jsx';
import NotificationItemActionButton from './NotificationItemActionButton.jsx';

const NotificationTournamentItem = ({
  notification, joinRoom, cancel, getKey, tournamentInfo, viewResult, roundInfo
}) => {
  if (!notification.actionOnEntity) {
    console.log("notification.actionOnEntity undefined");
    return (
      <div>
      </div>
    );
  }
  const { countdown } = notification.actionOnEntity;
  const subtractingTime = (countdown - (60 * TIMES.OVERTIME_TOURNAMENT)) >= 0 ?
    TIMES.OVERTIME_TOURNAMENT : TIMES.START_TOURNAMENT_BEFORE;
  const count = subtractingTime === TIMES.OVERTIME_TOURNAMENT ?
    countdown - (60 * subtractingTime) : countdown;
  const messages = MESSAGES().GAME_ROOM_TOURNAMENT_DATA;
  const craftMessage = () => {
    let message;
    if (countdown > 0) {
      if (subtractingTime === TIMES.OVERTIME_TOURNAMENT) {
        message = messages.TIMES_REMAIN_START_TOURNAMENT;
      } else {
        message = messages.LATE_TOURNAMENT;
      }
    } else {
      message = messages.TIME_UP;
    }

    if (!tournamentInfo) return { message };
    const tournamentName = tournamentInfo.tournament.Name;
    const section = tournamentInfo.section;
    const level = section ? section.name : '';
    const players = section ? section.registeredUserIds.length : 0;

    return {
      message,
      tournamentName,
      level,
      players,
    };
  };

  const {
    message,
    tournamentName,
    level,
    players,
  } = craftMessage();

  const myName = Meteor.user().username;
  let opponentName = roundInfo.pairData.players[0].playerId;
  if (opponentName == myName) {
    opponentName = roundInfo.pairData.players[1].playerId;
  }
  

  return (
    <NotificationItemWrapper
      notification={notification}
      getKey={getKey}
      viewResult={countdown === 0 ? viewResult : null}
    >
      <div className="noti-item__col-content">
        <div className="noti-item__content">
          <div className="noti-item__content__msg">
            <b>{tournamentName}</b> {message}
          </div>
          <NotificationItemContentInfo
            player={`vs: ${opponentName}`}
            level={`Section: '${level}'`}
            round={`Round: ${roundInfo.roundData.round}`}
          />
        </div>
      </div>
      <NotificationItemActionButton
        accept={joinRoom}
        decline={cancel}
        countdown={count}
        msg={{
          accept: 'Join',
          decline: 'X',
          info: 'Ended'
        }}
      />
    </NotificationItemWrapper>
  );
};

export default NotificationTournamentItem;
