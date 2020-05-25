/* globals Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _get from 'lodash/get';
import {
  ActiveGameList, UserAICodeProd, Actions, GameItem
} from '../../../../../lib/collections';

import { ROLES, GAME_TYPE, ITEM_GAME_TYPE, BACKGROUND_ITEMS, MAIN_ITEMS } from '../../../../../lib/enum';
import PlayGame from '../components/playgame';

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export const composer = ({ context, roomId, history }, onData) => {
  const { Meteor } = context();
  const localuserId = Meteor.userId();

  if (!localuserId) {
    history.push('/signin');
    return;
  }


  const idparts = Meteor.userId().split("_");

  // const legitUsers = ["kEmnDrYssC2gKNDxx"];

  // if (Meteor.user().username.indexOf("autorunner_") != 0 || Meteor.user().username.indexOf("@mail.com") <0 ) {

  // if (!legitUsers.includes(Meteor.userId())) {
  if (idparts[0] != "autorunner" || !isNumeric(idparts[1])) {
    console.log(`this user can't run autorun ${Meteor.userId()}`);
    history.push('/');
  }

  // console.log("dddd new update in playgame.js container");

  if (Meteor.subscribe('GameRoomListWithId', roomId).ready()
  && Meteor.subscribe('gameItem.getAll').ready()
  && Meteor.subscribe('EveryUserAICodeProd').ready()) {
    const room = ActiveGameList.findOne({ _id: roomId });
    if (!room) {
      console.log("can't find this active game ");
      history.push('/gamesBoard');
      return;
    }

    const { playerInfo } = room;
    const hostInfo = playerInfo[0];
    const yourInfo = playerInfo[0];
    const opponentInfo = playerInfo[1];
    // console.log(roomId, room);
    // get table asset
    const backgroundItems = GameItem.findOne({
      type: _get(BACKGROUND_ITEMS, [room.gameId, 0]),
      _id: {
        $in: _get(room.isPractice ? yourInfo : hostInfo, 'defaultItems', [])
      }
    });

    const mainItems = GameItem.findOne({
      type: _get(MAIN_ITEMS, [room.gameId, 0], ''),
      _id: {
        $in: _get(yourInfo, 'defaultItems', [])
      }
    });
    const opponentMainItems = GameItem.findOne({
      type: _get(MAIN_ITEMS, [room.gameId, 0], ''),
      _id: {
        $in: _get(opponentInfo, 'defaultItems', [])
      }
    });
    console.log(`dddd check room is active ${room.isActive} ${room}`);
    if (room && room.isActive) {
      // if (!Meteor.subscribe('UserAICodeProd', room.gameId, 'Standard').ready()) {
      //   console.log("UserAICodeProd " + room.gameId + " not ready ");
      //   return;
      // }
      console.log("dddd room is active ");
      const newMove = null;
      if (true) {
        // newMove = Actions.findOne({ _id: room._id });
        // room.actions = newMove.actions;
        room.actions = null;

        if (room && room.isActive) {
          // let code = null;
          // const isAIUser = Roles.userIsInRole(Meteor.userId(), ROLES.AI);

          const players = room.playerInfo;

          console.log(`dddd players is ${JSON.stringify(players)}`);
          // const playerInfo = [];
          const config = {
            pairData: history.location.state ? history.location.state.pairData : [],
            roomId,
            isGameOver: false
          };

          for (let ind = 0; ind < players.length; ind += 1) {
            const playerUserId = players[ind].userId;
            const onePlayerInfo = { playerUserId };
            // const meteorUser = Meteor.users.findOne({ _id: playerUserId });
            onePlayerInfo.playerID = players[ind].username; // meteorUser.username;
            onePlayerInfo.playerType = players[ind].playerType;
            onePlayerInfo.username = players[ind].username;

            if (onePlayerInfo.playerType === "AI") {
              let versionName = players[ind].aiVersion;
              let label = "";
              if (players[ind].aiVersion) {
                onePlayerInfo.aiVersion = players[ind].aiVersion;
                label = players[ind].aiLabel;
              } else {
                versionName = 'aicodesystem';
                label = "system";
              }
              // Note here: Because we are mapping versionName with Id of UserAICodeProd so we create query below
              const query = { userId: playerUserId, _id: versionName };
              const aiCode = UserAICodeProd.findOne(query);
              if (typeof (aiCode) === "undefined") {
                // console.log("can not find AI code for " + JSON.stringify(query));
                // console.log("do not load code for player " + onePlayerInfo.playerID);
                onePlayerInfo.PlayerCode = `empty code for player ${onePlayerInfo.playerID}`;
                // Bert.alert("cannot find new player setup to resume game!", 'danger', 'growl-bottom-left');
              } else {
                console.log(`----load my ai code or system ai code ${versionName}`);
                onePlayerInfo.PlayerCode = aiCode.PlayerCode;
              }

              if (room.gameType == GAME_TYPE.PRACTICE) {
                if (label != "") { onePlayerInfo.playerID = `AI [${label}]`; } else { onePlayerInfo.playerID = `AI ${onePlayerInfo.aiVersion}`; }
              }
            }

            onePlayerInfo.localInput = localuserId === playerUserId;
            onePlayerInfo.playerRating = 0;
            onePlayerInfo.ready = players[ind].ready; // will be set in reportPlayerReadyToPlay method
            onePlayerInfo.teamID = players[ind].teamID;
            if (!onePlayerInfo.teamID) {
              onePlayerInfo.teamID = ind % 2;
            }
            onePlayerInfo.userId = players[ind].userId;
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
            // playerInfo.push(onePlayerInfo);
            playerInfo[ind] = onePlayerInfo;
          }

          room.playerInfo = playerInfo;
          config.backgroundItems = backgroundItems;
          config.mainItems = mainItems;
          config.opponentMainItems = opponentMainItems;

          console.log('59', config, room);
          onData(null, { config, room });
        } else {
          const config = { isGameOver: true, roomId };
          config.backgroundItems = backgroundItems;
          config.mainItems = mainItems;
          config.opponentMainItems = opponentMainItems;
          // console.log('65', config, room);
          onData(null, { config, room });
        }
      }
    } else {
      // no such room!
      // history.push(`/gamesRoomNetwork/${room.gameRoomId}`);
      history.push('/gamesBoard');
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
