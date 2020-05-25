import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GameRoomTournamentNetwork from '../components/GameRoomTournamentNetwork.jsx';
import { CHAT_SENDER } from '../../../../lib/enum';

export const composer = ({ context, history, roomId }, onData) => {
  const { Meteor, Collections } = context();
  const currentOpponentIds = [];
  let users = [];
  const checkInRoom = (arr) => {
    return arr.find(item => item.userId === Meteor.userId());
  };
  const getUsers = (opponentIds) => {
    opponentIds.map((id) => {
      if (!currentOpponentIds.includes(id)) {
        currentOpponentIds.push(id);
      }

      return null;
    });
    if (Meteor.subscribe('userGetAvatar', currentOpponentIds).ready()) {
      users = Meteor.users.find(
        { _id: { $in: currentOpponentIds } },
        {
          fields: {
            username: 1,
            avatar: 1,
            'profile.coins': 1
          }
        }
      ).fetch();
    }
  };
  const mergeSenderInChatLogs = (chatLogs) => {
    return chatLogs.reduce((o, cur) => {
      const occurs = o.reduce((n, item, i, arr) => {
        return (arr[arr.length - 1][0].sender === cur.sender && cur.sender !== CHAT_SENDER.SYSTEM) ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs] = o[occurs].concat(cur); // eslint-disable-line
      } else {
        const obj = [cur];
        o = o.concat([obj]); // eslint-disable-line
      }
      return o;
    }, []);
  };
  const getOpponentInformationFromGameData = (playerInfo) => {
    const opponent = playerInfo.find(player => player.userId !== Meteor.userId());

    getUsers([opponent.userId || '']);
  };
  const getOpponentInformationFromChatLogs = (chatLogs) => {
    const opponentIds = [
      ...new Set(chatLogs.map((item) => {
        if (item.sender === CHAT_SENDER.SYSTEM) {
          return item.owner;
        }
        return item.sender;
      }))
    ];

    getUsers(opponentIds);
  };

  if (roomId) {
    if (Meteor.subscribe('gameRoom.findById', roomId).ready()
      && Meteor.subscribe('tournamentRoundFindByRoundId', history.location.state.roundId).ready()) {
      const gameData = Collections.GameRoom.findOne({ _id: roomId });
      let countdown = null;

      if (gameData) {
        getOpponentInformationFromGameData(gameData.playerInfo);

        if (gameData.chatLogs) {
          getOpponentInformationFromChatLogs(gameData.chatLogs);
          gameData.chatLogs = mergeSenderInChatLogs(gameData.chatLogs);
        }

        let checkUserStatus = null;
        if (gameData.playerInfo.length < 2) {
          checkUserStatus = {
            userId: '',
            ready: false
          };
        } else {
          checkUserStatus = gameData.playerInfo.find(player => player.ready === false);
        }
        const round = Collections.TournamentRound.findOne({ _id: history.location.state.roundId });
        const pairData = round.pairs[history.location.state.pairData.id];
        pairData.roundId = round._id;
        pairData.sectionId = round.sectionId;
        pairData.tournamentId = round.tournamentId;
        pairData.owner = gameData.owner;
        if (Meteor.subscribe('countdownTournament', roomId, !checkUserStatus, round._id).ready()) {
          countdown = Collections.Countdown.findOne({ _id: roomId });
        }

        console.log("dddd game room countdown is " + countdown);

        if (gameData && checkInRoom(gameData.playerInfo)) {
          const game = Collections.Games.findOne({ _id: gameData.gameId });

          onData(null, { gameData, game, checkUserStatus, round, pairData, countdown, users });
        } else {
          history.push('/');
        }
      }
    } else {
      onData(null, { loading: true });
    }
  }
};

export const depsMapper = (context, actions) => ({
  invitePlayer: actions.gameRoom.invitePlayer,
  tournamentClearRoom: actions.gameRoom.tournamentClearRoom,
  createTournamentGameMatch: actions.tournament.createTournamentGameMatch,
  updatePairStatus: actions.gameRoom.updatePairStatus,
  updateStatus: actions.gameRoom.updateStatus,
  tournamentLeaveRoom: actions.gameRoom.tournamentLeaveRoom,
  updatePoint: actions.gameRoom.updatePoint,
  deleteNotification: actions.gameRoom.deleteNotification,
  sendMessage: actions.gameRoom.sendMessage,
  userReady: actions.gameRoom.userReady,
  changePlayerType: actions.gameRoom.changePlayerType,
  setPlayerTyping: actions.gameRoom.setPlayerTyping,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameRoomTournamentNetwork);
