/* globals Roles */
/* eslint object-shorthand: [2, "consistent"] */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {
  GameRoom, ActiveGameList, ParentEmail, Games,
  TournamentSection, TournamentRound, Tournament,
  Notifications, UserAICodeProd, AutoRunMatchList
} from '../../lib/collections';

import {
  GAME_INVITE_STATUS,
  REGISTER_BUTTON,
  PLAYER_STATUS,
  GAME_CONFIG_OPTION,
  NOTIFICATION,
  GAME_TYPE,
  ROLES,
  USER_ACTION_IN_ROOM,
  TOURNAMENT_ROUND_STATUS,
  SLOT_OPTION
} from '../../lib/enum';
import { generateSystemMessage } from '../../lib/messages';
import { getDetailItemsForUserId, getEmptyConnectionInfo } from '../../lib/util';

export default function () {
  Meteor.methods({

    // new auto run match allocator! find an waiting auto run and create an active game for it
    'requestAutoRunId'() {
      // check(runnerUserId, String);
      const runnerUserId = this.userId;
      // find a new autorun
      const nextRun = AutoRunMatchList.findOne({ status: "NEW" });
      if (!nextRun) {
        console.log("no auto run task left!");
        return null;
      }
      console.log(`allocating ${nextRun._id} to ${runnerUserId}`);
      AutoRunMatchList.update({ _id: nextRun._id }, { $set: { status: "TRYALLOC", runnerId: runnerUserId } });
      return nextRun._id;
    },

    'confirmNextAutoRunRoom'(runId) {
      check(runId, String);
      const runnerUserId = this.userId;
      const nextRun = AutoRunMatchList.findOne({ _id: runId, status: "TRYALLOC", runnerId: runnerUserId });
      if (!nextRun) {
        // double booked!
        return null;
      }

      // create game room!
      console.log(`creating new auto run game for ${runId}`);
      // let diff = 0;
      // if (nextRun.level == "Advanced") diff = 1;

      const playerInfo = [];

      playerInfo.push({
        teamID: "0",
        slot: 0,
        playerType: "AI",
        ready: false,
        userId: nextRun.team0Users[0].userId,
        username: nextRun.team0Users[0].username,
        aiVersion: nextRun.team0Users[0].aiVersion,
        defaultItems: getDetailItemsForUserId(nextRun.team0Users[0].userId)
      });

      playerInfo.push({
        teamID: "1",
        slot: 1,
        playerType: "AI",
        ready: false,
        userId: nextRun.team1Users[0].userId,
        username: nextRun.team1Users[0].username,
        aiVersion: nextRun.team1Users[0].aiVersion,
        defaultItems: getDetailItemsForUserId(nextRun.team1Users[0].userId)
      });

      const networkPlayers = [];
      const numberOfPlayers = playerInfo.length;
      const usersInRoom = Array(numberOfPlayers).fill(false);
      for (let i = 0; i < numberOfPlayers; i++) {
        const pi = playerInfo[i];
        if (pi.userId) {
          networkPlayers.push(pi);
        } else {
          usersInRoom[pi.slot] = true;
        }
      }
      const networkPlayerSlots = networkPlayers.map(p => p.slot);
      const connectionInfo = getEmptyConnectionInfo(networkPlayerSlots);

      const config = { // eslint-disable-line
        playerInfo: playerInfo,
        gameId: nextRun.gameId,
        difficulty: nextRun.level,
        bothEnteredRoom: false,
        isActive: true,
        usersInRoom,
        connectionInfo,
        lastInd: -1,
        ballPosSnapshot: [],
        gameType: GAME_TYPE.AUTORUN,
        createdAt: new Date(),
        runId
      };

      const activeGameListId = ActiveGameList.insert(config);


      TournamentRound.update(
        {
          _id: nextRun.roundId,
          'pairs.id': nextRun.pairIndex
        },
        {
          $set: {
            'pairs.$.status': TOURNAMENT_ROUND_STATUS.IN_PROGRESS,
            'pairs.$.activeGameListId': activeGameListId
          }
        }
      );
      // GameRoom.update({ _id: gameOption.gameRoomId }, { $set: { inRoom: activeGameListId } });


      console.log(`updating auto run ${runId} to RUNNING ${activeGameListId} ${JSON.stringify(config)}`);
      AutoRunMatchList.update({ _id: runId }, { $set: { status: "RUNNING", runStartedAt: Date.now(), activeGameListId: activeGameListId } });

      return activeGameListId;
    },

    'gameRoom.startMatchGame'(gameOption) {
      check(gameOption, Match.ObjectIncluding({
        gameRoomId: String,
        gameId: String,
        difficulty: String,
        owner: String,
        playerInfo: [Object],
        aiVersion: Match.Maybe(String)
      }));

      let { playerInfo } = gameOption;
      playerInfo = playerInfo.map(_playerInfo => ({
        ..._playerInfo
        // teamId: _playerInfo.teamID
      }));


      for (let ind = 0; ind < playerInfo.length; ind += 1) {
        const onePlayerInfo = playerInfo[ind];
        // onePlayerInfo.playerType = gameOption.playerTypes[ind];
        // onePlayerInfo.teamId = ind < gameOption.playerTypes.length / 2 ? 0 : 1;
        // if (gameOption.aiVersion[ind]) {
        //   onePlayerInfo.aiVersion = gameOption.aiVersion[ind];
        // }
        // if (gameOption.aiLabel[ind]) {
        //   onePlayerInfo.aiLabel = gameOption.aiLabel[ind];
        // }
        // console.log("gameRoom.startMatchGame player again " + ind + " userId is " + onePlayerInfo.userId);
        const player = Meteor.users.findOne({_id: onePlayerInfo.userId});
        // console.log("gameRoom.startMatchGame player again coin " + ind + " is " + player.profile.coins);
        // console.log("gameRoom.startMatchGame player again " + ind + " is " + JSON.stringify(player.avatar));
        onePlayerInfo.playerAvatarURL = (player.avatar && player.avatar.url) ? player.avatar.url : '/images/default_avatar3.jpg';
        // console.log("gameRoom.startMatchGame player again " + ind + " is " + JSON.stringify(onePlayerInfo));
        if (playerInfo.playerType == "AI" && playerInfo.aiVersion == "") {
          onePlayerInfo.playerAvatarURL = '/images/default_avatar3.jpg';
        }
        // console.log("gameRoom.startMatchGame player avatar " + ind + " is " + onePlayerInfo.playerAvatarURL);
        onePlayerInfo.playerCoins = player.profile.coins;
        // onePlayerInfo.defaultItems = defaultItems;
      }
      
      // console.log("gameRoom.startMatchGame final playerinfo "+ JSON.stringify(playerInfo));

      const networkPlayers = [];
      const numberOfPlayers = playerInfo.length;
      const usersInRoom = Array(numberOfPlayers).fill(false);
      // change to have only one network player
      for (let i = 0; i < 2; i++) {
        const pi = playerInfo[i];
        if (pi.userId) {
          networkPlayers.push(pi);
        } else {
          usersInRoom[pi.slot] = true;
        }
      }

      const networkPlayerSlots = networkPlayers.map(p => p.slot);
      const connectionInfo = getEmptyConnectionInfo(networkPlayerSlots);

      console.log("get connectionInfo " + JSON.stringify(connectionInfo));

      const config = { // eslint-disable-line
        playerInfo,
        gameId: gameOption.gameId,
        difficulty: gameOption.difficulty,
        bothEnteredRoom: false,
        isActive: true,
        usersInRoom,
        connectionInfo,
        lastInd: -1,
        resumeGameId: gameOption.resumeGameId,
        ballPosSnapshot: [],
        gameType: gameOption.gameType || GAME_TYPE.MATCH,
        createdAt: new Date(),
        gameRoomId: gameOption.gameRoomId,
        owner: gameOption.owner,
        host: gameOption.owner
      };

      if (gameOption.aiVersion) {
        config.aiVersion = gameOption.aiVersion;
      }

      const activeGameListId = ActiveGameList.insert(config);
      console.log(`gameRoom.startMatchGame ${activeGameListId}`);
      const gameRoom = GameRoom.findOne({ _id: gameOption.gameRoomId });
      const type = USER_ACTION_IN_ROOM.START_GAME;

      if (!gameRoom.chatLogs) {
        gameRoom.chatLogs = [];
      }

      gameRoom.chatLogs.push({
        sender: 'SYSTEM',
        message: generateSystemMessage({ type }),
        owner: Meteor.userId()
      });

      GameRoom.update(
        { _id: gameOption.gameRoomId },
        {
          $set: {
            inRoom: activeGameListId, // set inRoom, which triggers history.push(`/playgame/${gameData.inRoom}`); in GameRoomNetwork.jsx
            chatLogs: gameRoom.chatLogs
          }
        }
      );

      // return activeGameListId;
    },
    'gameRoom.setGameRoomNetwork'(gameRoomId) {
      check(gameRoomId, String);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });
      if (!gameRoom) return;

      gameRoom.playerInfo.map((player) => {
        player.ready = player.userId === gameRoom.owner; // eslint-disable-line
        return player;
      });

      GameRoom.update(
        { _id: gameRoomId },
        {
          $set: {
            playerInfo: gameRoom.playerInfo
          },
          $unset: { inRoom: '' }
        }
      );
    },
    'gameRoom.joinRoomByInviteEmail'(inviteRoomId) {
      check(inviteRoomId, String);
      const user = Meteor.user();
      if (!user) {
        throw new Error('User is not found');
      }
      const email = user.emails[0].address;
      // Check from email database
      const emailCheck = ParentEmail.findOne({ email, inviteRoomId });
      if (!emailCheck) {
        throw new Error('Invite to room is not found');
      }
      // Check exist already game room
      const gameRoom = GameRoom.findOne({ _id: inviteRoomId });
      if (!gameRoom || (gameRoom.playerInfo[0].userId && gameRoom.playerInfo[1].userId)) {
        // Game is not exists now or have another user join room
        throw new Error('Game room is not exist now or another user join room');
      }
      // Join current user to room with manual
      let playerInfo = gameRoom.playerInfo;
      playerInfo = playerInfo.map((player) => {
        if (player.userId) {
          return player;
        }
        return {
          ...player,
          ready: true,
          playerType: GAME_CONFIG_OPTION.HUMAN,
          userId: user._id
        };
      });
      GameRoom.update(inviteRoomId, {
        $set: {
          playerInfo
        }
      });
      return inviteRoomId;
    },
    'gameRoom.changePlayerType'(gameRoomId, playerType, slot) {
      check(gameRoomId, String);
      check(playerType, String);
      check(slot, Match.Optional(Match.OneOf(Number, undefined)))

      console.log("changing slot 1 " + slot + " to playerType " + playerType);
      const gameRoom = GameRoom.findOne({ _id: gameRoomId });
      console.log("changing slot 2 " + slot + " to playerType " + playerType);
      if (!gameRoom) throw new Meteor.Error('Game room not found');
      let { playerInfo } = gameRoom;
      const userId = Meteor.userId();
      let userIndex;

      console.log("changing slot 3 " + slot + " to playerType " + playerType);
      playerInfo = playerInfo.map((player, index) => {
        if (player.userId !== userId) return player;
        if (typeof(slot) != "undefined" && slot != null) {
          if (index !== slot) return player;
        }
        userIndex = index;
        if (playerType === GAME_CONFIG_OPTION.HUMAN) {
          return {
            ...player,
            playerType: GAME_CONFIG_OPTION.HUMAN
          };
        }
        return {
          ...player,
          playerType: GAME_CONFIG_OPTION.AI
        };
      });
      // console.log("gameRoom.changePlayerType " + JSON.stringify(playerInfo));
      if (userIndex !== undefined) {
        const type = playerType === GAME_CONFIG_OPTION.HUMAN ? USER_ACTION_IN_ROOM.CHANGE_HUMAN_TYPE : USER_ACTION_IN_ROOM.CHANGE_ROBOT_TYPE;

        GameRoom.update(gameRoomId, {
          $set: {
            playerInfo: playerInfo
            // chatLogs: gameRoom.chatLogs
          },
          $push: {
            chatLogs: {
              sender: 'SYSTEM',
              message: generateSystemMessage({ type }),
              owner: Meteor.userId()
            }
          }
        });
        Meteor.defer(() => {
          Meteor.call('gameRoom.updateAIListForUserId', gameRoomId, playerInfo[userIndex].userId);
        });
      }
    },
    'gameRoom.create'(gameData) {
      check(gameData, Object);
      const gameRoomData = gameData;

      console.log("create game room with game id " + gameData.gameId);

      // Check ai list
      const playerCreated = { ...gameRoomData.playerInfo[0] };
      const aiListCount = UserAICodeProd.find({
        userId: playerCreated.userId,
        gameId: gameData.gameId
      }).count();

      if (aiListCount <= 0) {
        playerCreated.playerType = GAME_CONFIG_OPTION.HUMAN;
        playerCreated.ready = true;
        gameRoomData.playerInfo[0] = playerCreated;
      }
      // Set default items for user created
      gameRoomData.playerInfo[0].defaultItems = getDetailItemsForUserId(gameRoomData.playerInfo[0].userId);
      gameRoomData.createdAt = new Date();

      GameRoom.remove({owner: gameRoomData.owner});
      const roomId = GameRoom.insert(gameRoomData);
      console.log("new gameroom id " + roomId);

      Meteor.users.update({ _id: this.userId }, { $set: { inRoom: roomId } });

      // Add AI list to member info
      const isAiPlayer = Roles.userIsInRole(gameRoomData.owner, ROLES.AI);
      if (isAiPlayer) {
        Meteor.defer(() => {
          Meteor.call('gameRoom.updateAIListForUserId', roomId, gameRoomData.owner);
        });
      }

      console.log(`create game room with id ${roomId}`);

      return roomId;
    },
    'gameRoom.updateAIListForUserId'(gameRoomId, userId) {
      check([gameRoomId, userId], [String]);
      const gameRoom = GameRoom.findOne({ _id: gameRoomId });
      if (!gameRoom) throw new Meteor.Error('Game room not found - id:', gameRoomId);
      // list AI of current user
      const aiList = UserAICodeProd.find({
        userId: userId,
        gameId: gameRoom.gameId
      }, {fields:
        {_id: 1, releaseName: 1}
      }).fetch();

      gameRoom.playerInfo = _.map(gameRoom.playerInfo, (member) => {
        // update current player info
        if (member.userId === userId) {
          const isAiPlayer = member.playerType === GAME_CONFIG_OPTION.AI;
          const infoUpdate = { ...member };

          if (isAiPlayer) {
            infoUpdate.aiList = aiList;
            if (aiList && aiList.length > 0) {
              infoUpdate.aiVersion = aiList[0]._id;
            } else {
              infoUpdate.aiVersion = '';
            }
          }

          return infoUpdate;
        }

        return member;
      });

      GameRoom.update({ _id: gameRoomId }, { $set: { playerInfo: gameRoom.playerInfo } });
    },
    'gameRoomTournament.create'(gameData) {
      check(gameData, Object);
      gameData.createdAt = new Date();
      return GameRoom.insert(gameData);
    },
    'gameRoom.deleteFromGameRoom'(gameRoomId) {
      check(gameRoomId, String);

      try {
        const gameRoom = GameRoom.findOne({ _id: gameRoomId });
        if (typeof (gameRoom) === 'undefined') return;
        GameRoom.remove({ _id: gameRoomId });
        Meteor.users.update({ inRoom: gameRoomId }, { $unset: { inRoom: '' } }, { multi: true });

        const now = new Date();
        const playerInfos = gameRoom.playerInfo.filter(element => element.userId && element.userId !== gameRoom.owner);

        if (playerInfos.length > 0) {
          const players = playerInfos.filter(e => e.userId === this.userId).map(e => ({
            playerId: e.userId,
            deletedAt: now
          }));
          const readByPlayers = playerInfos.filter(e => e.userId === this.userId).map(e => ({
            readerId: e.userId,
            readAt: now
          }));

          Notifications.update(
            {
              entityId: gameRoomId
            },
            {
              $set: {
                status: GAME_INVITE_STATUS.HOST_CANCEL
              },
              $push: {
                readBy: {
                  $each: readByPlayers
                },
                isDelete: {
                  $each: players
                }
              }
            }, {
              multi: true
            }
          );
        }
      } catch (error) {
        throw new Meteor.Error('error delete gameRoom', error);
      }
    },
    'gameRoom.delete'(gameRoomId, notiId) {
      check(gameRoomId, String);
      check(notiId, String);

      try {
        const gameRoom = GameRoom.findOne({ _id: gameRoomId });
        if (typeof (gameRoom) === 'undefined') return;

        console.log(`deleting game room ${gameRoomId} notiId ${JSON.stringify(notiId)}`);
        GameRoom.remove({ _id: gameRoomId });
        Meteor.users.update({ inRoom: gameRoomId }, { $unset: { inRoom: '' } }, { multi: true });

        const now = new Date();
        const playerInfos = gameRoom.playerInfo.filter(element => element.userId && element.userId !== gameRoom.owner);

        if (playerInfos.length > 0) {
          const players = playerInfos.filter(e => e.userId === this.userId).map(e => ({
            playerId: e.userId,
            deletedAt: now
          }));
          const readByPlayers = playerInfos.filter(e => e.userId === this.userId).map(e => ({
            readerId: e.userId,
            readAt: now
          }));
          if (notiId.length > 0) {
            if (gameRoom.inRoom) {
              console.log("delete noti 1 ");
              Notifications.update(
                {
                  _id: notiId
                },
                {
                  $push: {
                    readBy: {
                      $each: readByPlayers
                    },
                    isDelete: {
                      $each: players
                    }
                  }
                }
              );
            } else {
              const noti = Notifications.findOne({ _id: notiId });
              // console.log("found noti 2 " + JSON.stringify(noti));
              if (noti && noti.status !== GAME_INVITE_STATUS.HOST_CANCEL) {
                Notifications.update(
                  {
                    _id: notiId
                  },
                  {
                    $set: {
                      status: GAME_INVITE_STATUS.HOST_CANCEL
                    },
                    $push: {
                      readBy: {
                        $each: readByPlayers
                      },
                      isDelete: {
                        $each: players
                      }
                    }
                  }
                );
              }
            }
          }
        }
      } catch (error) {
        throw new Meteor.Error('error delete gameRoom', error);
      }
    },
    'gameRoom.invitePlayer'(inviteInfo) {
      check(inviteInfo, Object);

      const gameRoom = GameRoom.findOne({ _id: inviteInfo.gameRoomId });
      const game = Games.findOne({ _id: gameRoom.gameId });
      let notiId = '';
      const userId = Meteor.userId();

      if (gameRoom) {
        let flag = 0;
        gameRoom.playerInfo = _.map(gameRoom.playerInfo, (item) => {
          if (item.teamID === inviteInfo.teamID && inviteInfo.slot === item.slot && !flag) {
            flag = 1;
            const isAI = Roles.userIsInRole(inviteInfo.userId, ROLES.AI);
            const aiListCount = UserAICodeProd.find({
              userId: inviteInfo.userId,
              gameId: gameRoom.gameId
            }).count();
            return {
              ...item,
              teamID: item.teamID,
              playerType: (isAI && aiListCount > 0) ? GAME_CONFIG_OPTION.AI : GAME_CONFIG_OPTION.HUMAN,
              userId: inviteInfo.userId, // just only for network player
              playerID: inviteInfo.userId, // the name showed in game
              ready: false,
              defaultItems: getDetailItemsForUserId(inviteInfo.userId),
              slot: item.slot,
              invitedBy: userId,
              username: inviteInfo.username
            };
          }

          return item;
        });

        // console.log("in gameRoom.invitePlayer after update playerInfo");

        const gameData = {
          id: game._id,
          name: game.title
        };

        gameRoom.username = Meteor.users.findOne({ _id: gameRoom.owner }).username;
        const craftNotiObject = {
          gameLevel: gameRoom.level,
          teamSize: gameRoom.playerInfo.length / 2,
          game: gameData,
          status: GAME_INVITE_STATUS.WAITING,
          entityType: NOTIFICATION.INVITE_TO_PLAY_GAME,
          entityId: gameRoom._id,
          sender: {
            type: 'user',
            userId: gameRoom.owner,
            fullName: gameRoom.username
          },
          recipients: [
            inviteInfo.userId
          ],
          actionOnEntity: {}
        };

        // generate notification object to insert
        notiId = Meteor.call('notification.generateNoti', craftNotiObject);
        // console.log("in gameRoom.invitePlayer after notification.generateNoti");
        // update user
        Meteor.users.update(
          { _id: inviteInfo.userId },
          { $push: { invite: { gameRoomId: inviteInfo.gameRoomId } } }
        );
        // console.log("in gameRoom.invitePlayer after update user");
        GameRoom.update({ _id: inviteInfo.gameRoomId }, { $set: gameRoom });
        // console.log("in gameRoom.invitePlayer after update game room");
      }

      return notiId;
    },
    'gameRoom.userReady'(gameRoomId, newvalue) {
      check(gameRoomId, String);
      check(newvalue, Boolean);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });

      if (gameRoom) {
        gameRoom.playerInfo = gameRoom.playerInfo.map((item) => {
          if (item.userId === Meteor.userId()) {
            console.log("setting user ready to " + item.userId + " " + item.slot + ": " + (newvalue));
            const type = newvalue ? USER_ACTION_IN_ROOM.READY : USER_ACTION_IN_ROOM.NOT_READY;
            if (!gameRoom.chatLogs) {
              gameRoom.chatLogs = [];
            }
            gameRoom.chatLogs.push({
              sender: 'SYSTEM',
              message: generateSystemMessage({ type }),
              owner: Meteor.userId()
            });
            item.ready = newvalue; // eslint-disable-line
          }

          return item;
        });

        GameRoom.update(
          { _id: gameRoomId },
          {
            $set: {
              playerInfo: gameRoom.playerInfo,
              chatLogs: gameRoom.chatLogs
            }
          }
        );
      }
    },
    'gameRoom.acceptInvite'(gameRoomId, notiId) {
      check(gameRoomId, String);
      check(notiId, Match.Maybe(String));

      const userId = Meteor.userId();
      const gameRoom = GameRoom.findOne(
        { _id: gameRoomId },
        {
          gameId: 1,
          playerInfo: 1,
          chatLogs: 1
        }
      );

      if (gameRoom) {
        Meteor.users.update({ _id: userId }, { $unset: { invite: '' } });

        // check if current user is AI account
        let aiList = [];
        const isAIAccount = Roles.userIsInRole(userId, ROLES.AI);

        if (isAIAccount) {
          // list AI of current user
          aiList = UserAICodeProd.find({
            userId: userId,
            gameId: gameRoom.gameId
          }, {fields:
            {_id: 1, releaseName: 1}
          }).fetch();
          console.log("got ai list: " + JSON.stringify(aiList));
        }

        // refresh playerInfo field
        gameRoom.playerInfo = _.map(gameRoom.playerInfo, (member) => {
          if (member.userId === userId) {
            const isAiPlayer = member.playerType === GAME_CONFIG_OPTION.AI;
            const memberInfo = {
              ...member,
              inRoom: true,
              // AI Player must select AI version later
              ready: false
            };

            if (isAiPlayer) {
              memberInfo.aiList = aiList;
              if (aiList && aiList.length > 0) {
                memberInfo.aiVersion = aiList[0]._id;
                memberInfo.ready = false;
              } else {
                memberInfo.aiVersion = '';
                memberInfo.ready = false;
              }
            }

            return memberInfo;
          }

          return member;
        });
        const type = USER_ACTION_IN_ROOM.JOIN_ROOM;

        GameRoom.update({ _id: gameRoomId }, {
          $set: {
            playerInfo: gameRoom.playerInfo
            // chatLogs: gameRoom.chatLogs
          },
          $push: {
            chatLogs: {
              sender: 'SYSTEM',
              message: generateSystemMessage({ type }),
              owner: Meteor.userId()
            }
          }
        });

        Meteor.users.update({ _id: userId }, { $set: { inRoom: gameRoomId } });
        if (notiId) {
          Notifications.update(
            { _id: notiId },
            {
              $set: {
                status: GAME_INVITE_STATUS.ACCEPT
              },
              $push: {
                readBy: {
                  readerId: userId,
                  readAt: new Date()
                },
                isDelete: {
                  playerId: userId,
                  deletedAt: new Date()
                }
              }
            }
          );
          Meteor.defer(() => {
            Notifications.find(
              {
                $and: [
                  {
                    recipients: userId,
                    status: { $ne: GAME_INVITE_STATUS.HOST_CANCEL }
                  },
                  {
                    $or: [
                      {
                        isDelete: {
                          $exists: false
                        }
                      },
                      {
                        isDelete: {
                          $eq: []
                        }
                      },
                      {
                        'isDelete.playerId': {
                          $ne: userId
                        }
                      }
                    ]
                  }
                ]
              },
              {
                entityId: 1,
                _id: 1
              }
            ).map(notification => Meteor.call('gameRoom.declineInvite', notification.entityId, notification._id));
          });
        }
        return gameRoomId;
      }
      return null;
    },

    'gameRoom.hostCancelInvite'(gameRoomId, notiId, userId) {
      check(gameRoomId, String);
      check(notiId, String);
      check(userId, String);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });
      if (gameRoom) {
        let opponentId = null;
        const player = _.find(gameRoom.playerInfo, playerItem => playerItem.userId === userId);
        opponentId = player.userId;
        GameRoom.update(
          { _id: gameRoomId, 'playerInfo.userId': opponentId },
          {
            $set:
            {
              'playerInfo.$': {
                ...player,
                playerType: GAME_CONFIG_OPTION.DEFAULT,
                ready: false,
                invitedBy: null,
                userId: null
              }
            }
          }
        );

        if (opponentId) {
          Meteor.users.update(
            { _id: opponentId },
            { $pull: { invite: { gameRoomId: gameRoomId } } }
          );
          if (Meteor.user().invite && Meteor.user().invite.length === 0) {
            Meteor.users.update({ _id: opponentId }, { $unset: { invite: '' } });
          }
        }

        if (notiId.length > 0) {
          Notifications.update(
            {
              recipients: { $in: [userId] },
              entityId: gameRoomId
            },
            {
              $set: {
                status: GAME_INVITE_STATUS.HOST_CANCEL
              }
            }
          );
        }
      }
    },

    'gameRoom.declineInvite'(gameRoomId, notiId) {
      check(gameRoomId, String);
      check(notiId, String);

      const userId = Meteor.userId();

      if (!userId) {
        return;
      }
      const gameRoom = GameRoom.findOne(
        { _id: gameRoomId },
        {
          playerInfo: 1
        }
      );

      if (gameRoom) {
        const player = _.find(gameRoom.playerInfo, playerItem => playerItem.userId === userId);

        GameRoom.update(
          { _id: gameRoomId, 'playerInfo.userId': userId },
          {
            $set:
            {
              'playerInfo.$': {
                ...player,
                playerType: GAME_CONFIG_OPTION.DEFAULT,
                ready: false,
                invitedBy: null,
                userId: null
              }
            }
          }
        );
        Meteor.users.update({ _id: userId }, { $pull: { invite: { gameRoomId: gameRoomId } } });
        if (Meteor.user().invite && Meteor.user().invite.length === 0) {
          Meteor.users.update({ _id: userId }, { $unset: { invite: '' } });
        }
      }
      Notifications.update(
        { _id: notiId },
        {
          $set: {
            status: GAME_INVITE_STATUS.REJECT
          },
          $push: {
            readBy: {
              readerId: userId,
              readAt: new Date()
            },
            isDelete: {
              playerId: userId,
              deletedAt: new Date()
            }
          }
        }
      );
    },
    'gameRoom.handleLogout'(userId) {
      check(userId, String);

      const userLogout = Meteor.users.findOne({ _id: userId });

      // handle clear invitation
      if (userLogout && userLogout.invite && userLogout.invite.length > 0) {
        const invitationList = userLogout.invite;

        _.forEach(invitationList, (inviteItem) => {
          const { gameRoomId } = inviteItem;
          const currentRoom = GameRoom.findOne({ _id: gameRoomId });

          if (currentRoom) {
            const player = _.find(currentRoom.playerInfo, playerItem => playerItem.userId === userId);

            GameRoom.update(
              {
                _id: gameRoomId,
                'playerInfo.userId': userId
              },
              {
                $set: {
                  'playerInfo.$':
                  {
                    ...player,
                    playerType: GAME_CONFIG_OPTION.DEFAULT,
                    ready: false,
                    inRoom: false,
                    userId: null,
                    invitedBy: null
                  }
                }
              }
            );
          }
        });

        Meteor.users.update({ _id: userId }, { $unset: { invite: '' } });
        const now = new Date();

        Notifications.update(
          { recipients: { $in: [userId] } },
          {
            $set: {
              status: GAME_INVITE_STATUS.REJECT
            },
            $push: {
              readBy: {
                readerId: userId,
                readAt: now
              },
              isDelete: {
                playerId: userId,
                deletedAt: now
              }
            }
          },
          {
            multi: true
          }
        );
      }
      // check if user in is room
      if (userLogout && userLogout.inRoom) {
        const currentRoom = GameRoom.findOne({ _id: userLogout.inRoom });

        Meteor.users.update({ _id: userId }, { $unset: { inRoom: '' } });

        if (currentRoom && currentRoom.owner === userId && !currentRoom.isTournament) {
          // handle when user is owner of room. clear data of gameroom
          const playerInfos = currentRoom.playerInfo.filter(element => element.userId && element.userId !== currentRoom.owner);
          const now = new Date();
          const players = playerInfos.filter(e => e.userId === this.userId).map(e => ({
            playerId: e.userId,
            deletedAt: now
          }));
          const readByPlayers = playerInfos.filter(e => e.userId === this.userId).map(e => ({
            readerId: e.userId,
            readAt: now
          }));

          Notifications.update(
            {
              entityId: currentRoom._id
            },
            {
              $set: {
                status: GAME_INVITE_STATUS.HOST_CANCEL
              },
              $push: {
                readBy: {
                  $each: readByPlayers
                },
                isDelete: {
                  $each: players
                }
              }
            }, {
              multi: true
            }
          );

          Meteor.users.update({ inRoom: currentRoom._id }, { $unset: { inRoom: '' } }, { multi: true });
          GameRoom.remove({ _id: currentRoom._id });
        } else if (currentRoom && currentRoom.isTournament) {
          // handle when user in tournament
          GameRoom.update(
            {
              _id: currentRoom._id,
              'playerInfo.teamID': userId
            },
            {
              $set: {
                'playerInfo.$.ready': false
              }
            }
          );
        } else if (currentRoom) {
          // user is in room but not owner
          const player = _.find(currentRoom.playerInfo, playerItem => playerItem.userId === userId);
          GameRoom.update(
            { _id: currentRoom._id, 'playerInfo.userId': userId },
            {
              $set:
              {
                'playerInfo.$': {
                  ...player,
                  playerType: GAME_CONFIG_OPTION.DEFAULT,
                  ready: false,
                  invitedBy: null,
                  userId: null
                }
              }
            }
          );
        }
      }
    },
    'gameRoom.handleSelectOption'(gameRoomId, userId, aiVersion) {
      check(gameRoomId, String);
      check(userId, String);
      check(aiVersion, String);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });

      if (gameRoom) {
        gameRoom.playerInfo = gameRoom.playerInfo.map((player) => {
          if (player.userId === userId) {
            const type = USER_ACTION_IN_ROOM.CHANGE_ROBOT_VERSION;
            const ai = player.aiList.find(item => item._id === aiVersion);

            if (!gameRoom.chatLogs) {
              gameRoom.chatLogs = [];
            }
            gameRoom.chatLogs.push({
              sender: 'SYSTEM',
              message: generateSystemMessage({ type: type, objective: ai.releaseName }),
              owner: Meteor.userId()
            });

            if (player.aiVersion) {
              player.aiVersion = aiVersion; // eslint-disable-line no-param-reassign
            } else {
              return Object.assign({ aiVersion }, player);
            }
          }
          return player;
        });

        GameRoom.update({ _id: gameRoomId }, { $set: gameRoom });
      }
    },
    'gameRoom.updateAICodeForRobotSlot'(gameRoomId, teamID) {
      check([gameRoomId, teamID], [String]);

      try {
        const gameRoom = GameRoom.findOne({ _id: gameRoomId });
        if (gameRoom) {
          const newUpdated = {};
          const piLength = gameRoom.playerInfo.length;
          const leader = gameRoom.playerInfo.filter(pi => pi.teamID == teamID)[0]; // eslint-disable-line
          for (let i = 0; i < piLength; i++) {
            const pi = gameRoom.playerInfo[i];
            if (pi.slotOption === SLOT_OPTION.ROBOT) {
              const aiVersionField = `playerInfo.${pi.slot}.aiVersion`;
              const aiListField = `playerInfo.${pi.slot}.aiList`;
              newUpdated[aiVersionField] = leader.aiVersion;
              newUpdated[aiListField] = leader.aiList;
            }
          }

          GameRoom.update(
            {
              _id: gameRoomId
            },
            {
              $set: newUpdated
            }
          );
        } else {
          throw new Meteor.Error('game room does not exist');
        }
      } catch (error) {
        console.log(error);
      }
    },
    'gameRoom.handleChangeSlotOption'(gameRoomId, teamID, slot, value) {
      check([gameRoomId, teamID, value], [String]);
      check(slot, Number);

      try {
        const gameRoom = GameRoom.findOne({ _id: gameRoomId });
        if (gameRoom) {
          const { playerInfo } = gameRoom;
          const leader = playerInfo.filter(p => p.teamID === teamID)[0];
          const { aiList: leaderAIList } = leader;
          const { aiVersion: leaderAIVersion } = leader;
          const slotOptionField = `playerInfo.${slot}.slotOption`;
          const playerIDField = `playerInfo.${slot}.playerID`;
          const readyField = `playerInfo.${slot}.ready`;
          const playerTypeField = `playerInfo.${slot}.playerType`;
          const aiListField = `playerInfo.${slot}.aiList`;
          const aiVersionField = `playerInfo.${slot}.aiVersion`;
          const userIdField = `playerInfo.${slot}.userId`;

          let newUpdated = {};

          if (value === SLOT_OPTION.NETWORK_PLAYER) {
            newUpdated = {
              [playerIDField]: null,
              [readyField]: false,
              [playerTypeField]: GAME_CONFIG_OPTION.DEFAULT,
              [aiListField]: [],
              [aiVersionField]: null,
              [slotOptionField]: value,
              [userIdField]: null
            };
          } else if (value === SLOT_OPTION.ROBOT) {
            newUpdated = {
              [playerIDField]: `ROBOT-${slot}`,
              [readyField]: false,
              [playerTypeField]: GAME_CONFIG_OPTION.AI,
              [aiListField]: leaderAIList,
              [aiVersionField]: leaderAIVersion,
              [slotOptionField]: value,
              [userIdField]: Meteor.userId()
            };
          }

          console.log("update info " + userIdField);

          GameRoom.update(
            {
              _id: gameRoomId
            },
            {
              $set: newUpdated
            }
          );
        } else {
          throw new Meteor.Error('game room does not exist');
        }
      } catch (error) {
        console.log(error);
      }
    },
    'gameRoom.tournament.registerUser'(type, gameId, tournamentId, sectionKey) {
      check([type, gameId, tournamentId, sectionKey], [String]);
      const userId = Meteor.userId();
      if (type === REGISTER_BUTTON.WITHDRAW) {
        TournamentSection.update(
          {
            _id: sectionKey
          },
          {
            $pull: {
              registeredUserIds: {
                userId: userId
              }
            }
          }
        );
        Meteor.users.update({
          _id: Meteor.userId(),
          'playGames.gameId': gameId
        }, { $pull: { 'playGames.$.tournamentIds': tournamentId } });
      } else {
        TournamentSection.update(
          {
            _id: sectionKey
          },
          {
            $push: {
              registeredUserIds: {
                userId: userId,
                // BYE means this team doesn't have any match for one round due to odd number of teams
                hasBYE: false, // has taken BYE in previous rounds
                isBYE: false, // is taking BYE this round, so will get a point for free
                rating: Meteor.user().playGames.find(playGame => playGame.gameId === gameId).rating,
                isFirstMove: false, // is he taking first move this round
                firstMoveCount: 0, // how many rounds has this player been taking first move
                prevOpponentTeamsInThisTournament: '', // a list of all teams this team has played to be used to avoid duplicate opponents
                point: 0
              }
            }
          }
        );
        Meteor.users.update({
          _id: Meteor.userId(),
          'playGames.gameId': gameId
        }, { $push: { 'playGames.$.tournamentIds': tournamentId } });
      }
    },
    'gameRoom.updateStatus'(gameRoomId) {
      check(gameRoomId, String);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });
      if (gameRoom) {
        let team = 0;
        let member = _.find(gameRoom.team1, item => item.option === this.userId);

        if (!member) {
          team = 1;
          member = _.find(gameRoom.team2, item => item.option === this.userId);
        }
        let status = PLAYER_STATUS.Unprepared;

        if (member.status === PLAYER_STATUS.Unprepared) {
          status = PLAYER_STATUS.Ready;
        }

        if (team) {
          GameRoom.update({ _id: gameRoomId, team2: { $elemMatch: { option: this.userId } } }, { $set: { 'team2.$.status': status } });
        } else {
          GameRoom.update({ _id: gameRoomId, team1: { $elemMatch: { option: this.userId } } }, { $set: { 'team1.$.status': status } });
        }
      }
    },
    'gameRoom.kickUser'(gameRoomId, team, index) {
      check(gameRoomId, String);
      check(team, String);
      check(index, Number);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });

      if (gameRoom) {
        const changeMember = {
          index: index,
          option: 'default',
          status: PLAYER_STATUS.Unprepared
        };

        const query = {
          [`${team}.${index}`]: changeMember
        };
        const userId = gameRoom[team][index].option;

        GameRoom.update({ _id: gameRoomId }, { $set: query });
        Meteor.users.update({ _id: userId }, { $unset: { inRoom: '' } });
      }
    },
    'gameRoom.leaveRoom'(gameRoomId) {
      check(gameRoomId, String);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });
      const { userId } = this;

      if (userId) {
        Meteor.users.update({ _id: userId }, { $unset: { inRoom: '' } });
      }

      if (gameRoom && userId) {
        gameRoom.playerInfo = _.map(gameRoom.playerInfo, (member) => {
          if (member.userId === userId) {
            return {
              ...member,
              playerType: GAME_CONFIG_OPTION.DEFAULT,
              userId: null,
              ready: false,
              defaultItems: [],
              inRoom: false,
              invitedBy: null
            };
          }
          return member;
        });

        const type = USER_ACTION_IN_ROOM.QUIT_ROOM;

        if (!gameRoom.chatLogs) {
          gameRoom.chatLogs = [];
        }
        gameRoom.chatLogs.push({
          sender: 'SYSTEM',
          message: generateSystemMessage({ type }),
          owner: Meteor.userId()
        });

        GameRoom.update({ _id: gameRoom._id }, { $set: gameRoom });
        Meteor.call('gameRoom.setPlayerTyping', gameRoomId, false);
      }
    },
    'gameRoom.switchTeam'(gameRoomId, currentTeam) {
      check(gameRoomId, String);
      // check(team, String);
      check(currentTeam, Object);

      const gameRoom = GameRoom.findOne({ _id: gameRoomId });

      if (gameRoom) {
        let flag = 0;
        gameRoom.playerInfo = _.map(gameRoom.playerInfo, (member) => {
          if (member.userId === this.userId) {
            return {
              teamID: member.teamID,
              playerType: GAME_CONFIG_OPTION.DEFAULT,
              ready: false
            };
          } if (
            member.playerType === GAME_CONFIG_OPTION.DEFAULT
            && member.teamID !== currentTeam.teamID
            && !flag) {
            flag = 1;
            return Object.assign(currentTeam, { teamID: member.teamID });
          }

          return member;
        });

        GameRoom.update({ _id: gameRoomId }, { $set: gameRoom });
      }
    },
    'gameRoom.updatePoint'(roundId, playerId, pairIndex, typeOfPlayer) {
      check([roundId, playerId, typeOfPlayer], [String]);
      check(pairIndex, Number);

      const round = TournamentRound.findOne({ _id: roundId });
      Meteor.defer(() => {
        Meteor.call('finishTournamentSectionRound', round._id, playerId, pairIndex, typeOfPlayer);
      });

      const tournament = Tournament.findOne({ _id: round.tournamentId });
      return {
        gameId: tournament.gameId,
        sectionKey: round.sectionId
      };
    },
    'gameRoom.sendMessage'(gameRoomId, message) {
      check([message, gameRoomId], [String]);

      GameRoom.update(
        { _id: gameRoomId },
        {
          $push: {
            chatLogs: {
              sender: Meteor.userId(),
              message: message,
              owner: Meteor.userId()
            }
          }
        }
      );
    },
    'gameRoom.setPlayerTyping'(gameRoomId, isTyping) {
      check(gameRoomId, String);
      check(isTyping, Boolean);

      const gameRoom = GameRoom.findOne(gameRoomId);

      if (gameRoom) {
        if (!gameRoom.playerIsTyping) {
          gameRoom.playerIsTyping = [];
        }

        switch (isTyping) {
          case true:
            if (!gameRoom.playerIsTyping.find(userId => userId === Meteor.userId())) {
              gameRoom.playerIsTyping.push(Meteor.userId());
            }
            break;
          case false:
            if (gameRoom.playerIsTyping.find(userId => userId === Meteor.userId())) {
              gameRoom.playerIsTyping = gameRoom.playerIsTyping.filter(userId => userId !== Meteor.userId());
            }
            break;
        }

        GameRoom.update({ _id: gameRoomId }, { $set: { playerIsTyping: gameRoom.playerIsTyping } });
      }
    }
  });
}
