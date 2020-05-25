/* globals Roles, Bert */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _get from 'lodash/get';
import {
  ActiveGameList, UserAICodeProd, Actions, GameItem
} from '../../../../../lib/collections';

import {
  MIGRATION_CONST, GAME_TYPE, GAME_CONFIG_OPTION, BACKGROUND_ITEMS, MAIN_ITEMS
} from '../../../../../lib/enum';
import PlayGame from '../components/playgame';
import { debug } from 'util';

function replaceAll(str, find, replace) {
  if (!str) return "undefined";
  return str.replace(new RegExp(find, 'g'), replace);
}

const cleanuprobotcode = (code) => {
  let newcode = replaceAll(code, "debugger", "");
  newcode = replaceAll(newcode, "console.log", "");
  return newcode;
};

export const composer = ({ context, roomId, history }, onData) => {
  const { Meteor } = context();
  const localuserId = Meteor.userId();
  if (!localuserId) {
    history.push('/signin');
    return;
  }

  // if (Meteor.subscribe('GameRoomListWithMe', localuserId).ready()
  if (Meteor.subscribe('GameRoomListWithRoomId', roomId).ready()
    && Meteor.subscribe('gameItem.getAll').ready()) {
    const activeRoom = ActiveGameList.findOne({ _id: roomId });
    const resumeCommands = {};
    if (!activeRoom) {
      console.log("playgame: no room so exit");
      if (window.gameSetup) {
        if (window.gameSetup.sounds.backgroundmusic) window.gameSetup.sounds.backgroundmusic.stop();
        if (!window.gameSetup.inModal) {
          const MODAL_NOBUTTON = 2; // read only
          window.gameSetup.showModalMessage(`Leaving Game Room`, ` `, MODAL_NOBUTTON);
        }
      }
      setTimeout(() => {
        history.push('/gamesBoard');
      }, 4000);
      return;
    }
    if (activeRoom.resumeGameId) {
      if (!Meteor.subscribe('OneResumeGame', activeRoom.resumeGameId).ready()) {
        console.log('57', activeRoom);
        return;
      }
      const prevRoom = ActiveGameList.findOne({ _id: activeRoom.resumeGameId });
      resumeCommands.playerIDs = [prevRoom.playerInfo[0].userId, prevRoom.playerInfo[1].userId];
      const allcmds = prevRoom.gameCommandHistory;
      for (let k = allcmds.length - 1; k >= 0; k--) {
        const pp = allcmds[k].split(";");
        if (!resumeCommands.newPlayerCmd && pp[2] === "NewActivePlayerInfo") {
          resumeCommands.newPlayerCmd = allcmds[k];
        }
        if (resumeCommands.newPlayerCmd && !resumeCommands.showMessageCmd && pp[2] === "ShowMessage") {
          resumeCommands.showMessageCmd = allcmds[k];
        }
        if (resumeCommands.newPlayerCmd && !resumeCommands.allStopCmd && pp[2] === "ALLBALLSTOPPED") {
          resumeCommands.allStopCmd = allcmds[k];
        }
        // if (resumeCommands.allStopCmd) {
        if (pp[2] === "UpdateTimer") {
          const qq = pp[4].split("_");
          if (!resumeCommands[`timerCommand${qq[0]}`]) { resumeCommands[`timerCommand${qq[0]}`] = qq[1]; }
        }
        // }
      }

      // if (!resumeCommands.allStopCmd) {
      //   // no all stop found, so fresh start!
      // }
    }
    const { playerInfo } = activeRoom;
    const hostInfo = activeRoom.isPractice ? playerInfo[0] : playerInfo.find(info => info.userId === activeRoom.owner);
    const yourInfo = playerInfo.find(info => info.userId === Meteor.userId());
    // console.log(roomId, room);
    // get table asset
    const backgroundItems = GameItem.findOne({
      type: _get(BACKGROUND_ITEMS, [activeRoom.gameId, 0]),
      _id: {
        $in: _get(activeRoom.isPractice ? yourInfo : hostInfo, 'defaultItems', [])
      }
    });

    // Items assign to userId
    const mainItems = playerInfo.filter(i => i.userId).map(
      pInfo => ({
        userId: pInfo.userId,
        ...GameItem.findOne({
          type: _get(MAIN_ITEMS, [activeRoom.gameId, 0], ''),
          _id: {
            $in: _get(pInfo, 'defaultItems', [])
          }
        })
      })
    );

    if (activeRoom && activeRoom.isActive) {
      // if (!Meteor.subscribe('UserAICodeProd', room.gameId, 'Standard').ready()) {
      //   console.log("UserAICodeProd " + room.gameId + " not ready ");
      //   return;
      // }

      let newMove = null;
      let bypassGameBattleCondition = true;
      if (activeRoom.gameType === GAME_TYPE.BATTLE) {
        bypassGameBattleCondition = Meteor.subscribe('userAICode.getAllForGameRoom', activeRoom._id).ready();
      }
      if (Meteor.subscribe('ActiveGameList', activeRoom._id).ready() && bypassGameBattleCondition) {
        newMove = Actions.findOne({ _id: activeRoom._id });
        activeRoom.actions = newMove.actions;

        if (activeRoom && activeRoom.isActive) {
          // let code = null;

          // if (room.aiVersion) {
          //   code = UserAICodeProd.findOne({ _id: room.aiVersion, userId: Meteor.userId() });
          // } else {
          //   code = UserAICodeProd.findOne({ userId: 'system', gameId: room.gameId, SubTrackName: 'Standard' });
          // }

          // const isAIUser = Roles.userIsInRole(Meteor.userId(), ROLES.AI);

          const players = activeRoom.playerInfo;

          const playerInfoTemp = [];
          const config = {
            pairData: history.location.state ? history.location.state.pairData : [],
            roomId,
            isGameOver: false
          };
          for (let ind = 0; ind < players.length; ind += 1) {
            const playerUserId = players[ind].userId;
            const onePlayerInfo = { playerUserId };
            const meteorUser = Meteor.users.findOne({ _id: playerUserId });
            // if (playerUserId) {
            //   onePlayerInfo.playerID = meteorUser.username;
            // }
            onePlayerInfo.playerID = players[ind].playerID;
            onePlayerInfo.playerType = players[ind].playerType;
            onePlayerInfo.username = meteorUser.username;
            onePlayerInfo.playerAvatarURL = players[ind].playerAvatarURL;
            onePlayerInfo.playerCoins = players[ind].playerCoins;
            // console.log("onePlayerInfo.playerCoins " + ind + " " + onePlayerInfo.playerCoins);

            if (onePlayerInfo.playerType === GAME_CONFIG_OPTION.AI) {
              let versionName = players[ind].aiVersion;
              let label = "";
              // console.log("AI version for " + ind + ": " + versionName);
              if (players[ind].aiVersion) {
                onePlayerInfo.aiVersion = players[ind].aiVersion;
                label = players[ind].aiLabel;
              } else {
                versionName = 'aicodesystem';
                if (activeRoom.gameId === MIGRATION_CONST.tankGameId) {
                  versionName = 'aitankcodesystem';
                } else if (activeRoom.gameId === MIGRATION_CONST.match3GameId) {
                  versionName = 'aicodesystemmatch3';
                }
                label = "system";
              }
              // Note here: Because we are mapping versionName with Id of UserAICodeProd so we create query below
              // const query = { userId: playerUserId, _id: versionName };
              // Note: aitankcodesystem belong to userId: system.
              const query = { _id: versionName };
              const aiCode = UserAICodeProd.findOne(query);
              if (typeof (aiCode) === "undefined") {
                // console.log("can not find AI code for " + JSON.stringify(query));
                // console.log("do not load code for player " + onePlayerInfo.playerID);
                onePlayerInfo.PlayerCode = `empty code for player ${onePlayerInfo.playerID}`;
                // Bert.alert("cannot find new player setup to resume game!", 'danger', 'growl-bottom-left');
              } else {
                // console.log("load my ai code or system ai code " + versionName);
                onePlayerInfo.PlayerCode = aiCode.PlayerCode;
                if (activeRoom.gameType === GAME_TYPE.BATTLE && playerUserId !== Meteor.userId()) {
                  // remove all logging and debugger line from opponent code to avoid code leakage
                  onePlayerInfo.PlayerCode = cleanuprobotcode(aiCode.PlayerCode);
                }
                onePlayerInfo.playerCodeOwner = aiCode.userId;
              }

              if (activeRoom.gameType === GAME_TYPE.PRACTICE) {
                if (label !== "") {
                  onePlayerInfo.playerID = `AI [${label}]`;
                  onePlayerInfo.username = `AI [${label}]`;
                } else {
                  onePlayerInfo.playerID = `AI`;
                  onePlayerInfo.username = `AI`;
                }

              }

              if (activeRoom.gameType === GAME_TYPE.BATTLE || activeRoom.gameType === GAME_TYPE.MATCH) {
                onePlayerInfo.playerID += `(AI)`;
                onePlayerInfo.username += `(AI)`;
              }

            }

            onePlayerInfo.localInput = activeRoom.gameType === GAME_TYPE.BATTLE ? true : localuserId === playerUserId;
            onePlayerInfo.playerRating = 0;
            onePlayerInfo.ready = players[ind].ready; // will be set in reportPlayerReadyToPlay method
            onePlayerInfo.teamID = players[ind].teamID;
            onePlayerInfo.slot = players[ind].slot;
            if (!onePlayerInfo.teamID) {
              onePlayerInfo.teamID = ind % 2;
            }
            onePlayerInfo.userId = players[ind].userId;
            // search this user's playgames for his reating
            if (playerUserId) {
              for (let j = 0; j < meteorUser.playGames.length; j += 1) {
                if (meteorUser.playGames[j].gameId === activeRoom.gameId) {
                  onePlayerInfo.playerRating = meteorUser.playGames[j].rating;
                }
              }
            }

            // if (onePlayerInfo.playerType == 'AI') {
            //   debugger;
            //   if (onePlayerInfo.userId == Meteor.userId())
            //     onePlayerInfo.PlayerCode = code.PlayerCode;
            //   // if (!isAIUser) {
            //   //   onePlayerInfo.playerID = "TGame Bot";
            //   // }
            // }
            playerInfoTemp.push(onePlayerInfo);
          }

          activeRoom.playerInfo = playerInfoTemp;

          config.backgroundItems = backgroundItems;
          config.mainItems = mainItems;
          if (activeRoom.resumeGameId) {
            if (resumeCommands.newPlayerCmd) {
              config.resumeCommands = resumeCommands;
            } else {
              Bert.alert("cannot find new player setup to resume game!", 'danger', 'growl-bottom-left');
              return;
            }
          }
          // console.log("update room data " + room.gameId + " ");
          // debugger;
          // console.log('59', config, roomId);
          onData(null, { config, room: activeRoom });
        } else {
          const config = { isGameOver: true, roomId };
          config.backgroundItems = backgroundItems;
          config.mainItems = mainItems;
          // console.log('65', config, activeRoom);
          onData(null, { config, room: activeRoom });
        }
      }
    } else {
      // no such room!
      console.log("playgame: no room 2 so exit");
      history.push(`/gamesRoomNetwork/${activeRoom.gameRoomId}`);
    }
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  reportEnteringGameRoom: actions.luckypool.reportEnteringGameRoom,
  addPhaserIlluminated: actions.luckypool.addPhaserIlluminated,
  leavingRoom: actions.luckypool.leavingRoom,
  unmarkUserAsLeavingRoom: actions.luckypool.unmarkUserAsLeavingRoom,
  markUserAsLeavingRoom: actions.luckypool.markUserAsLeavingRoom,
  setGameRoomNetwork: actions.luckypool.setGameRoomNetwork
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(PlayGame);
