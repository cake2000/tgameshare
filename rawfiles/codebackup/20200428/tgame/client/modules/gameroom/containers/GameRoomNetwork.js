import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GameRoomNetwork from '../components/GameRoomNetwork.jsx';
import { CHAT_SENDER } from '../../../../lib/enum';

export const composer = ({ context, history, roomId }, onData) => {
  const { Meteor, Collections } = context();
  const currentOpponentIds = [];
  let users = [];

  if (!Meteor.userId()) {
    history.push('/');
  }

  const checkInRoom = (arr) => {
    return _.find(arr, item => item.userId === Meteor.userId());
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

  // console.log("room update " + roomId + " " + Date.now());
  if (roomId) {
    // console.log("room update valid " + roomId + " " + Date.now());
    if (Meteor.subscribe('gameRoom.findById', roomId).ready()) {
      const gameData = Collections.GameRoom.findOne({ _id: roomId });
      if (gameData) {
        // console.log("check in room? " + JSON.stringify(checkInRoom(gameData.playerInfo)));
      }
      if (gameData && (gameData.owner === Meteor.userId() ||
        checkInRoom(gameData.playerInfo))) {
        // console.log("got gameData " + JSON.stringify(gameData).substr(0, 10));

        const game = Collections.Games.findOne({ _id: gameData.gameId });

        // console.log("getOpponentInformationFromGameData " + JSON.stringify(gameData.playerInfo));
        getOpponentInformationFromGameData(gameData.playerInfo);
        if (gameData.chatLogs) {
          getOpponentInformationFromChatLogs(gameData.chatLogs);
          gameData.chatLogs = mergeSenderInChatLogs(gameData.chatLogs);
        }

        if (gameData && gameData.inRoom) {
          console.log("game room network 2 get inRoom so to go /playgame " + gameData.inRoom);
          history.push(`/playgame/${gameData.inRoom}`);
        } else {
          onData(null, { gameData, game, users, isGamePool: game.name === 'lucky_pool' });
        }
      } else {
        console.log("go back to /gamesBoard 2");
        history.push('/gamesBoard');
      }
    } else {
      console.log("room update still loading 1" + Date.now());
      onData(null, { loading: true });
    }
  } else if (Meteor.userId() && Meteor.subscribe('gameRoom.findByOwner', Meteor.userId()).ready()) {
    const gameData = Collections.GameRoom.findOne({ owner: Meteor.userId() });
    let previousGame = [];
    if (gameData) {
      const date = new Date();

      date.setDate(date.getDate() - 1);
      const playerInfo = gameData.playerInfo.filter(player => player.userId);
      if (playerInfo.length === gameData.playerInfo.length) {
        const selector = {
          $and: [],
          isActive: false,
          winners: [],
          createdAt: { $gte: date }
        };

        playerInfo.map(player => selector.$and.push({
          playerInfo: {
            $elemMatch: {
              userId: player.userId
            }
          }
        }));
        previousGame = Collections.ActiveGameList.find(selector, { sort: { createdAt: -1 } }).fetch();
      }

      const game = Collections.Games.findOne({ _id: gameData.gameId });

      if (gameData.chatLogs) {
        getOpponentInformationFromChatLogs(gameData.chatLogs);
        gameData.chatLogs = mergeSenderInChatLogs(gameData.chatLogs);
      } else {
        getOpponentInformationFromGameData(gameData.playerInfo);
      }

      onData(null, { gameData, game, users, previousGame, isGamePool: game.name === 'lucky_pool' });
    } else {
      // console.log("go back to /gamesBoard from GameRoomNetwork.js 1");
      history.push('/gamesBoard');
    }
  } else {
    onData(null, { loading: true });
  }
};

export const depsMapper = (context, actions) => ({
  changePlayerType: actions.gameRoom.changePlayerType,
  invitePlayer: actions.gameRoom.invitePlayer,
  clearGameRoomNoNotiId: actions.gameRoom.clearGameRoomNoNotiId,
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
  handleChangeSlotOption: actions.gameRoom.handleChangeSlotOption,
  updateAICodeForRobotSlot: actions.gameRoom.updateAICodeForRobotSlot,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameRoomNetwork);
