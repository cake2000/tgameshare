import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import { CHAT_SENDER } from '../../../../lib/enum';
import GameRoomNetwork from '../components/GameRoomNetwork.jsx';

export const composer = ({ context, history, roomId }, onData) => {
  const { Meteor, Collections } = context();
  const currentOpponentIds = [];
  let users = [];

  if (!Meteor.userId()) {
    history.push('/');
  }

  const legitUsers = ["kEmnDrYssC2gKNDxx"];

  if (!legitUsers.includes(Meteor.userId())) {
    history.push('/');
  }

  // request a new active game rooom to be created from queue
  Meteor.call("requestAutoRunId", (err, nextRunId) => {
    if (err) {
      console.log(err.reason);
      history.push('/');
    } else {
      console.log("got nextRunId " + nextRunId);
      if (nextRunId == null) {
        console.log("no match to run so wait 5s to try again!");
        onData(null, { loading: false });
        setTimeout(() => {
          // if (history.location.pathName == "/autorungame")
            history.push('/autorungame');
        }, 5000);
      } else {
        // wait then confirm
        setTimeout(() => {
          Meteor.call("confirmNextAutoRunRoom", nextRunId, (err2, roomID) => {
            if (err2) {
              console.log(err2.reason);
              history.push('/');
            } else {
              console.log("confirmed run room " + roomID);
              if (!roomID) {
                console.log("double booked!");
                setTimeout(() => {
                  history.push('/autorungame');
                }, 1000);
              } else {
                console.log("going to room now playgameautorun");
                history.push(`/playgameautorun/${roomID}`);
              }
            }
          });
        }, 1000);
      }
    }
  });
};

export const depsMapper = (context, actions) => ({
  changePlayerType: actions.gameRoom.changePlayerType,
  invitePlayer: actions.gameRoom.invitePlayer,
  clearGameRoom: actions.gameRoom.clearGameRoom,
  handleSelectOption: actions.gameRoom.handleSelectOption,
  createGameMatch: actions.gameRoom.createGameMatch,
  createGame: actions.gameRoom.createGame,
  updateStatus: actions.gameRoom.updateStatus,
  kickUser: actions.gameRoom.kickUser,
  cancleInvite: actions.gameRoom.cancleInvite,
  leaveRoom: actions.gameRoom.leaveRoom,
  switchTeam: actions.gameRoom.switchTeam,
  hostCancelInvite: actions.gameRoom.hostCancelInvite,
  sendMessage: actions.gameRoom.sendMessage,
  userReady: actions.gameRoom.userReady,
  setPlayerTyping: actions.gameRoom.setPlayerTyping,
  context: () => context
});



const NothingToRun = ({
  loading, Round, section, match, history,
}) => (!loading ? (
  <div style={{ color: 'white', fontSize: 30, textAlign: 'center' }}> <br /> <br /> nothing to run</div>
) : <div  style={{ color: 'white', fontSize: 30, textAlign: 'center' }}>loading</div>);



export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(NothingToRun);
