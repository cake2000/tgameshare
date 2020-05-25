/* globals Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _get from 'lodash/get';
import {
  ActiveGameList, Actions, GameItem, UserAICodeProd
} from '../../../../../lib/collections';

import {
  ROLES, GAME_TYPE, ITEM_GAME_TYPE, MAIN_ITEMS, BACKGROUND_ITEMS
} from '../../../../../lib/enum';
import ReplayGame from '../../../buildMyAI/components/ReplayGame';


export const composer = ({ context, activeGameListId, history }, onData) => {
  const { Meteor } = context();
  // can be replayed by anyone!

  // const localuserId = Meteor.userId();
  // if (!localuserId) {
  //   history.push('/signin');
  //   return;
  // }

  // console.log("dddd new update in playgame.js container");

  if (Meteor.subscribe('GameRoomListWithId', activeGameListId).ready()
    && Meteor.subscribe('gameItem.getAll').ready()
    && Meteor.subscribe('userAICode.getAllForGameRoomLabel', activeGameListId).ready()
  ) {
    const allCode = UserAICodeProd.find().fetch();
    const room = ActiveGameList.findOne({ _id: activeGameListId });
    const resumeCommands = {};
    if (!room) {
      console.log(`game not found ${activeGameListId}`);
      history.push('/');
      return;
    }
    const { playerInfo } = room;
    const hostInfo = playerInfo[0];
    const nonhostInfo = playerInfo[1];
    // const yourInfo = playerInfo.find(info => info.userId === Meteor.userId());
    // const opponentInfo = playerInfo.find(info => info.userId !== Meteor.userId());
    // console.log(activeGameListId, room);
    // get table asset
    const backgroundItems = GameItem.findOne({
      type: _get(BACKGROUND_ITEMS, [room.gameId, 0]),
      _id: {
        $in: _get(hostInfo, 'defaultItems', [])
      }
    });

    const mainItems = GameItem.findOne({
      type: _get(MAIN_ITEMS, [room.gameId, 0], ''),
      _id: {
        $in: _get(hostInfo, 'defaultItems', [])
      }
    });
    const opponentMainItems = GameItem.findOne({
      type: _get(MAIN_ITEMS, [room.gameId, 0], ''),
      _id: {
        $in: _get(nonhostInfo, 'defaultItems', [])
      }
    });
    console.log(`dddd check room is active ${room.isActive} ${room}`);
    if (room) {
      // if (!Meteor.subscribe('UserAICodeProd', room.gameId, 'Standard').ready()) {
      //   console.log("UserAICodeProd " + room.gameId + " not ready ");
      //   return;
      // }
      if (true) {
        if (room) {
          // let code = null;

          // if (room.aiVersion) {
          //   code = UserAICodeProd.findOne({ _id: room.aiVersion, userId: Meteor.userId() });
          // } else {
          //   code = UserAICodeProd.findOne({ userId: 'system', gameId: room.gameId, SubTrackName: 'Standard' });
          // }

          const players = [];

          // console.log("dddd players is " + JSON.stringify(players));
          // const playerInfo = [];
          const config = {
            pairData: history.location.state ? history.location.state.pairData : [],
            activeGameListId,
            isGameOver: false
          };
          for (let ind = 0; ind < room.playerInfo.length; ind += 1) {
            const playerUserId = room.playerInfo[ind].userId;
            const onePlayerInfo = { playerUserId };
            // const meteorUser = Meteor.users.findOne({ _id: playerUserId });
            onePlayerInfo.playerID = room.playerInfo[ind].username;
            onePlayerInfo.playerType = room.playerInfo[ind].playerType;
            onePlayerInfo.username = room.playerInfo[ind].username;

            // if (onePlayerInfo.playerType === "AI") {
            //   let versionName = players[ind].aiVersion;
            //   let label = "";
            //   if (players[ind].aiVersion) {
            //     onePlayerInfo.aiVersion = players[ind].aiVersion;
            //     label = players[ind].aiLabel;
            //   } else {
            //     versionName = 'aicodesystem';
            //     label = "system";
            //   }
            //   // Note here: Because we are mapping versionName with Id of UserAICodeProd so we create query below

            //   if (room.gameType == GAME_TYPE.PRACTICE) {
            //     if (label != "")
            //       onePlayerInfo.playerID = `AI [${label}]`;
            //     else
            //       onePlayerInfo.playerID = `AI`;
            //   }
            // }

            onePlayerInfo.localInput = false;
            onePlayerInfo.aiVersion = room.playerInfo[ind].aiVersion;

            for (let j = 0; j < allCode.length; j++) {
              if (allCode[j].userId == playerUserId && allCode[j]._id == onePlayerInfo.aiVersion) {
                onePlayerInfo.aiVersion = allCode[j].releaseName;
                break;
              }
            }

            onePlayerInfo.defaultItems = room.playerInfo[ind].defaultItems;
            onePlayerInfo.playerRating = 0;
            onePlayerInfo.ready = true; // will be set in reportPlayerReadyToPlay method
            onePlayerInfo.teamID = room.playerInfo[ind].teamID;
            if (!onePlayerInfo.teamID) {
              onePlayerInfo.teamID = ind % 2;
            }
            onePlayerInfo.userId = room.playerInfo[ind].userId;
            // search this user's playgames for his reating
            // for (let j = 0; j < meteorUser.playGames.length; j += 1) {
            //   if (meteorUser.playGames[j].gameId === room.gameId) {
            //     onePlayerInfo.playerRating = meteorUser.playGames[j].rating;
            //   }
            // }

            // if (onePlayerInfo.playerType == 'AI') {
            //   debugger;
            //   if (onePlayerInfo.userId == Meteor.userId())
            //     onePlayerInfo.PlayerCode = code.PlayerCode;
            //   // if (!isAIUser) {
            //   //   onePlayerInfo.playerID = "TGame Bot";
            //   // }
            // }
            players.push(onePlayerInfo);
          }

          room.playerInfo = players;
          config.backgroundItems = backgroundItems;
          config.mainItems = mainItems;
          config.opponentMainItems = opponentMainItems;

          // console.log("update room data " + room.gameId + " ");
          // debugger;
          // console.log('59', config, room);
          onData(null, { config, activeGame: room });
        } else {
          console.log("no room?");
          const config = { isGameOver: true, activeGameListId };
          config.backgroundItems = backgroundItems;
          config.mainItems = mainItems;
          config.opponentMainItems = opponentMainItems;
          // console.log('65', config, room);
          onData(null, { config, activeGame: room });
        }
      }
    } else {
      console.log("no such room to replay");
      history.push(`/`);
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
)(ReplayGame);
