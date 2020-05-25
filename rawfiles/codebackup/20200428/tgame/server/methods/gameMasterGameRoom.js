import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
import _, { each } from 'lodash';
import EloRank from 'elo-rank';
import {
  LEVELS, COINS_WAGER, GAME_TYPE, PLAYER_TYPE, SLOT_OPTION, GAME_CONFIG_OPTION, POINTS
} from '../../lib/enum';
import {
  WaitingList, UserRobotCodeByLesson, FriendWaitingList, UserAICodeProd, ActiveGameList, GameRoom, AutoRunMatchList, Scenarios, UserLesson, UserFactoryCode
} from '../../lib/collections';

function getRating(user, gameId) {
  return _.get(_.find(user.playGames, { gameId }), 'rating', 50);
}

const dmp = DiffMatchPatch.DiffMatchPatch;

const getNextHost = (currentHostSlot, usersInRoom, playerInfo) => {
  const usersInRoomLength = usersInRoom.length;
  let nextHostSlot = currentHostSlot;
  for (let i = 0; i < usersInRoomLength; i++) {
    if (usersInRoom[i] && i != currentHostSlot && playerInfo[i].userId) {
      nextHostSlot = i;
      break;
    }
  }
  return playerInfo[nextHostSlot].userId;
};

// determine k factor based on team's rating range
export function getKFactor(rating) {
  let kFactor = 32;
  if (rating >= 2400) {
    kFactor = 8;
  } else if (rating >= 2000) {
    kFactor = 16;
  } else if (rating >= 1600) {
    kFactor = 24;
  } else if (rating >= 1200) {
    kFactor = 32;
  } else if (rating >= 800) {
    kFactor = 32;
  } else if (rating >= 400) {
    kFactor = 32;
  }
  return kFactor;
}

/**
 * Update user rating
 * @param {*} challenger
 * @param {*} opponent
 * @param {*} gameId
 *
 * @return {Number} new rating
 */
function updateUserGameRating(challenger, opponent, gameId) {
  const kFactor = getKFactor(challenger.rating);
  const elo = new EloRank(kFactor);

  const expectedScore = elo.getExpected(Math.max(50, challenger.rating), Math.max(50, opponent.rating));
  const actual = challenger.isWinner ? POINTS.WIN : POINTS.LOSE;
  const newRating = elo.updateRating(expectedScore, actual, challenger.rating);

  Meteor.users.update({ _id: challenger.userId, 'playGames.gameId': gameId }, {
    $set: {
      'playGames.$.rating': Math.max(50, newRating) // set rating floor at 50
    }
  });

  return newRating;
}

function setCoins(room, winnerIds, loserIds, winnerExtra = 0, loserExtra = 0) {
  if (room.gameType === GAME_TYPE.MATCH || room.gameType === GAME_TYPE.BATTLE) {
    console.log('set coin', 'winnerIds', winnerIds, ', loserIds', loserIds);
  // For now I want more players to play online games. So they can play for free.
  // if (room.gameType === GAME_TYPE.BATTLE) {
    const GAME_COINS = {
      [GAME_TYPE.MATCH]: {
        [LEVELS.ADVANCED]: COINS_WAGER.ADVANCED,
        [LEVELS.BEGINNER]: COINS_WAGER.BEGINNER
      },
      [GAME_TYPE.BATTLE]: {
        [LEVELS.ADVANCED]: COINS_WAGER.CHALLENGE,
        [LEVELS.BEGINNER]: COINS_WAGER.CHALLENGE
      }
    };
    const gameCoins = _.get(GAME_COINS, [room.gameType, room.difficulty], 0);

    console.log(`in set coins: extra ${winnerExtra} ${loserExtra} wager ${gameCoins}`);

    switch (room.gameType) {
      case GAME_TYPE.MATCH: {
        // Increase the rating of the winners
        Meteor.users.update(
          {
            _id: { $in: winnerIds }
          },
          {
            $inc: { 'profile.coins': gameCoins + winnerExtra }
          },
          {
            multi: 1
          }
        );

        // update the coins of the losers
        Meteor.users.find({ _id: { $in: loserIds } }).forEach((doc) => {
          let newUpdated;
          if (doc.profile.coins + loserExtra < gameCoins) {
            newUpdated = {
              $set: { 'profile.coins': 0 }
            };
          } else {
            newUpdated = {
              $inc: { 'profile.coins': (gameCoins * 0 + loserExtra) }
            };
          }

          Meteor.users.update(
            { _id: doc._id },
            newUpdated
          );
        });
        break;
      }
      case GAME_TYPE.BATTLE: {
        // This game needs to be classified:
        // 1. bot vs bot (AI battle)
        // 2. manual vs bot (Casual game) no coins or rating update happens after this game.
        const { playerInfo, gameRoomId, gameId } = room;
        const isAIBattle = _.get(playerInfo, [0, 'playerType']) === GAME_CONFIG_OPTION.AI;
        if (isAIBattle) {
          const gameRoom = GameRoom.findOne({ _id: gameRoomId });

          if (true) {
            // Step 3. If A wins the game, +50 coins.
            // Only increase the user who created the challenge.
            if (gameRoom && gameRoom.owner && _.indexOf(winnerIds, gameRoom.owner) !== -1) {
              console.log(`battle finished and pay owner 50 ${gameRoom.owner}`);
              Meteor.users.update({ _id: gameRoom.owner }, {
                $inc: { 'profile.coins': 50 + winnerExtra }
              });

              Meteor.users.update({ _id: { $in: loserIds } }, {
                $inc: { 'profile.coins': 0 + loserExtra }
              });
            } else {
              Meteor.users.update({ _id: { $in: winnerIds } }, {
                $inc: { 'profile.coins': 0 + winnerExtra }
              });

              Meteor.users.update({ _id: { $in: loserIds } }, {
                $inc: { 'profile.coins': 0 + loserExtra }
              });
            }
          } else {
            // reward winner 50 coins whoever it is!
            Meteor.users.update(
              {
                _id: { $in: winnerIds }
              },
              {
                $inc: { 'profile.coins': 50 }
              },
              {
                multi: 1
              }
            );
          }

          // Step 4. After the game is over, both players's bots get an updated rating.
          console.log("updating rating with winner " + winnerIds[0])
          const challenger = Meteor.users.findOne({ _id: playerInfo[0].userId, 'playGames.gameId': gameId }, { fields: { playGames: 1 } });
          const opponent = Meteor.users.findOne({ _id: playerInfo[1].userId, 'playGames.gameId': gameId }, { fields: { playGames: 1 } });

          const challengerRating = getRating(challenger, gameId);
          const opponentRating = getRating(opponent, gameId);

          const challengerPlayer = { userId: challenger._id, rating: challengerRating, isWinner: _.indexOf(winnerIds, challenger._id) >= 0 };
          const opponentPlayer = { userId: opponent._id, rating: opponentRating, isWinner: _.indexOf(winnerIds, opponent._id) >= 0 };

          // update Challenger's rating
          const challengerNewRating = updateUserGameRating(challengerPlayer, opponentPlayer, gameId);
          // update Opponent's rating
          const defenderNewRating = updateUserGameRating(opponentPlayer, challengerPlayer, gameId);

          // Update Challenge History
          Meteor.defer(() => {
            const winnerId = _.includes(winnerIds, challenger._id) ? challenger._id : opponent._id;

            Meteor.call('challengeHistory.create', {
              ownerId: challenger._id,
              winnerId,
              challenger: {
                _id: challenger._id,
                rating: challengerRating,
                ratingChange: [challengerRating, challengerNewRating],
                botReleaseId: _.get(playerInfo[0], 'aiVersion')
              },
              defender: {
                _id: opponent._id,
                rating: opponentRating,
                ratingChange: [opponentRating, defenderNewRating],
                botReleaseId: _.get(playerInfo[1], 'aiVersion')
              },
              gameId
            });
          });
        }
        break;
      }
      default:
        break;
    }

    return true;
  }

  return false;
}

const getPatch = function (oldv, newv) {
  const diff = dmp.diff_main(oldv, newv, true);

  if (diff.length > 2) {
    dmp.diff_cleanupSemantic(diff);
  }
  const patchList = dmp.patch_make(oldv, newv, diff);
  const patchText = dmp.patch_toText(patchList);

  return patchText;
};


export default function () {
  Meteor.methods({
    saveBallPosSnapshot(roomId, ballPosList) {
      check(roomId, String);
      check(ballPosList, [Object]);
      const userId = this.userId; // eslint-disable-line
      if (!userId) {
        console.log("can't find user id!");
        return;
      }

      const selector = {
        $and: [
          { _id: roomId },
          { playerInfo: { $elemMatch: { userId } } }
        ]
      };

      const room = ActiveGameList.findOne(selector);
      if (!room) {
        console.log(`can't find room with id ${roomId} and with userId in it ${userId}`);
        return;
      }
      // var posInd = "ballPos_" + room.lastInd; // ball pos after this move
      ActiveGameList.update(
        { _id: roomId },
        { $push: { ballPosSnapshot: ballPosList } }
      );
    },

    reportQuitGame(roomId) {
      check(roomId, String);
      const userId = this.userId; // eslint-disable-line
      if (!userId) {
        console.log("reportQuitGame: can't find user id!");
        return;
      }

      const selector = {
        $and: [
          { _id: roomId },
          { isActive: true },
          { playerInfo: { $elemMatch: { userId } } }
        ]
      };

      const room = ActiveGameList.findOne(selector);
      if (!room) {
        console.log(`reportQuitGame: can't find room with id ${roomId} and with userId in it ${userId}`);
        return;
      }

      if (room.gameEnded) {
        console.log('reportQuitGame: Game already eneded! ');
        return;
      }

      const newMove = { Type: 'QUIT', userId };
      const newInd = 1 + room.lastInd;
      let actions = room.actions; // eslint-disable-line

      if (!actions) {
        actions = [];
      }

      actions.push(newMove);

      const query = { lastInd: newInd, gameEnded: true, actions };
      // query[newInd] = newMove;
      ActiveGameList.update(
        { _id: roomId },
        { $set: query }
      );
    },
    //

    DeleteAICodeRelease(gameId, releaseName, SubTrackName) {
      check(gameId, String);
      check(SubTrackName, String);
      check(releaseName, String);

      const userId = this.userId; // eslint-disable-line

      if (!userId) {
        console.log("no user id in release ai code!");
        throw new Meteor.Error(400, 'Bad request!');
      }

      const thecode = UserAICodeProd.findOne({ releaseName, userId, gameId });

      if (thecode) {
        console.log("release exist!");
        UserAICodeProd.remove(
          { releaseName, userId, gameId }
        );
      }
    },

    LoadAICodeRelease(code, gameId, releaseName, SubTrackName, ScenarioID) {
      check(code, String);
      check(gameId, String);
      check(SubTrackName, String);
      check(releaseName, String);
      check(ScenarioID, String);


      const userId = this.userId; // eslint-disable-line

      if (!userId) {
        console.log("no user id in release ai code!");
        throw new Meteor.Error(400, 'Bad request!');
      }

      console.log(`LoadAICodeRelease ScenarioID is ${ScenarioID} ${gameId} ${userId}`);
      const thecode = UserAICodeProd.findOne({ releaseName, userId, gameId });

      if (thecode) {
        console.log(`release exist! ${gameId} ${this.userId}`);


        const sc = Scenarios.findOne({_id: ScenarioID});

        if (sc) {
          // console.log("old format scenario");
          // insert chg into userrobotcode
          const chgTxt = getPatch(code, thecode.PlayerCode);
          const chg = { time: new Date().getTime(), label: '', chg: chgTxt };

          UserRobotCodeByLesson.update(
            { UserID: this.userId, gameId, ScenarioID },
            { $push: { CodeUpdates: chg }, $set: { lastUpdateTime: Number(new Date()) } },
            { upsert: true }
          );
          // console.log("after update old scenario-based code");
        } else {

          if (ScenarioID.includes("factorytest_")) {
            // console.log("save release into factory code " + thecode.PlayerCode);
            UserFactoryCode.update(
              {
                userId: this.userId, gameId
              },
              { $set: { code: thecode.PlayerCode, asOfTime: new Date() } },
            );
            return;
          }


          // console.log("new format lesson");
          // update current slide's user code!
          const ul = UserLesson.findOne({lessonId: ScenarioID, userId});
          if (ul) {

            const log2 = ul.slideVisitLog.find(e => (e.slideId == ul.currentSlideId));
            // console.log("found ul thecode " + thecode.PlayerCode + " vs " + log2.userRobotCode);
            // const log = ul.slideVisitLog.find(e => (e.slideNode == log2.slideNode));
            if (log2.userRobotCode == thecode.PlayerCode) return;
      
            // console.log(`do load AI code into user robot code in slide for ${ul._id} ${thecode.PlayerCode}`);
      
            for (let j=0; j<ul.slideVisitLog.length; j++) {
              if (ul.slideVisitLog[j].slideId == log2.slideId) {
                const saveInd = (0 | ul.slideVisitLog[j].robotCodeInd) + 1;
                const opt = {};
                const ind = 'slideVisitLog.' + j + ".userRobotCode";
                opt[ind] = thecode.PlayerCode;
                const ind2 = 'slideVisitLog.' + j + ".robotCodeInd";
                opt[ind2] = saveInd;
                // console.log("opt is " + JSON.stringify(opt));
                UserLesson.update({_id: ul._id}, {$set: opt});
                return;
              }
            }
          } else {
            console.log("Error can't find user lesson with id " + ScenarioID + " " + userId);
          }
        }




        // return thecode.PlayerCode;
      } else {
        // should never be here!
        throw new Meteor.Error(409, 'NO_EXIST_NAME');
      }
    },

    ReleaseAICode(PlayerCode, gameId, releaseName, SubTrackName) {
      check(gameId, String);
      check(SubTrackName, String);
      check(PlayerCode, String);
      check(releaseName, String);

      const userId = this.userId; // eslint-disable-line

      if (!userId) {
        console.log("no user id in release ai code!");
        throw new Meteor.Error(400, 'Bad request!');
      }
      const checkValid = UserAICodeProd.findOne({ releaseName });

      if (checkValid) {
        console.log("release already exist!");
        UserAICodeProd.remove({
          userId, gameId, SubTrackName, releaseName
        });
        //   throw new Meteor.Error(409, 'EXIST_NAME');
      }
      const releasedAt = new Date();

      UserAICodeProd.insert(
        {
          userId, gameId, SubTrackName, releasedAt, PlayerCode, releaseName
        }
      );
    },

    reportPlaceCueBallMove(roomId, playerUserId, newx, newy) {
      check(roomId, String);
      check(playerUserId, String);
      check(newx, Number);
      check(newy, Number);
      const userId = this.userId; // eslint-disable-line
      if (!userId) {
        console.log("reportPlaceCueBallMove: can't find user id!");
        return;
      }

      const selector = {
        $and: [
          { _id: roomId },
          { isActive: true },
          { playerInfo: { $elemMatch: { userId } } }
        ]
      };

      const room = ActiveGameList.findOne(selector);
      if (!room) {
        console.log(`can't find room with id ${roomId} and with userId in it ${playerUserId}`);
        return;
      }

      const newMove = {
        Type: 'PLACECUEBALL', playerUserId, newx, newy
      };
      const newInd = 1 + room.lastInd;
      console.log(`record place cue ball: ${newInd} ${JSON.stringify(newMove)}`);
      let actions = room.actions; // eslint-disable-line

      if (!actions) {
        actions = [];
      }
      actions.push(newMove);
      const query = { lastInd: newInd, actions };
      ActiveGameList.update(
        { _id: roomId },
        { $set: query }
      );
    },

    reportNewGameMove(roomId, playerUserId, forcex, forcey, avx, avy, targetPocketID, targetBallID) { // eslint-disable-line max-len
      check(roomId, String);
      check(playerUserId, String);
      check(forcex, Number);
      check(forcey, Number);
      check(avx, Number);
      check(avy, Number);
      check(targetPocketID, Number);
      check(targetBallID, Number);
      const userId = this.userId; // eslint-disable-line
      if (!userId) {
        console.log("reportNewGameMove: can't find user id!");
        return;
      }

      const selector = {
        $and: [
          { _id: roomId },
          { isActive: true },
          { playerInfo: { $elemMatch: { userId } } }
        ]
      };

      const room = ActiveGameList.findOne(selector);
      if (!room) {
        console.log(`can't find room with id ${roomId} and with userId in it ${playerUserId}`);
        return;
      }

      const newMove = {
        Type: 'STRIKE', playerUserId, forcex, forcey, avx, avy, targetPocketID, targetBallID
      };

      const newInd = 1 + room.lastInd;
      let actions = room.actions; // eslint-disable-line

      if (!actions) {
        actions = [];
      }
      actions.push(newMove);
      const query = { lastInd: newInd, actions };
      ActiveGameList.update(
        { _id: roomId },
        { $set: query }
      );
    },
    recordGameResult(roomId, winnerUserId, player0Gold = 0, player1Gold = 0) {
      check(roomId, String);
      check(winnerUserId, String);
      check(player0Gold, Number);
      check(player1Gold, Number);
      const userId = this.userId; // eslint-disable-line
      let loserId = '';

      console.log(`report game result ${player0Gold} ${player1Gold}`);

      // if this user is one of the 2 players, then deactivate room
      const room = ActiveGameList.findOne(
        {
          $and: [
            { _id: roomId }
            // { playerInfo: { $elemMatch: { userId } } }
          ]
        }
      );

      if (room && !room.gameEnded) {
        console.log("handle game result");
        const userIds = [];
        each(room.playerInfo, (player) => {
          if (player.userId !== winnerUserId) {
            loserId = player.userId;
          }
          if (player.userId) {
            userIds.push(player.userId);
          }
        });
        let winnerExtraCoin = 0;
        let loserExtraCoin = 0;
        if (room.playerInfo[0].userId == winnerUserId) {
          winnerExtraCoin = player0Gold;
          loserExtraCoin = player1Gold;
        } else {
          winnerExtraCoin = player1Gold;
          loserExtraCoin = player0Gold;
        }
        console.log(`winner extra ${winnerExtraCoin} loser ${loserExtraCoin}`);
        Meteor.call('accountUserSetInGame', userIds, null);

        let noReward = false;
        // if (room.gameType == GAME_TYPE.BATTLE) {
        //   if (room.playerInfo[0].playerType == "Human") {
        //     // manual challenge
        //     noReward = true;
        //   } else {
        //     if (room.playerInfo[1].userId == winnerUserId) {
        //       noReward = true;
        //     }
        //   }
        // }
        if (room.gameType == GAME_TYPE.PRACTICE) {
          noReward = true;
        }

        if (room.playerInfo[0].userId == room.playerInfo[1].userId) {
          noReward = true;
        }

        if (!noReward) {
          Meteor.defer(() => {
            setCoins(room, [winnerUserId], [loserId], winnerExtraCoin, loserExtraCoin);
          });
        }

        ActiveGameList.update(
          { _id: roomId },
          {
            $set: { gameEnded: true },
            $addToSet: {
              winners: winnerUserId
            }
          }
        );

        if (room.runId) {
          const autoRun = AutoRunMatchList.findOne({ _id: room.runId });
          if (autoRun) {
            AutoRunMatchList.update({ _id: room.runId }, { $set: { status: "COMPLETED", runCompletedAt: Date.now(), winnerId: winnerUserId } });
            Meteor.defer(() => {
              Meteor.call('finishTournamentSectionRound', autoRun.roundId, winnerUserId, autoRun.pairIndex, PLAYER_TYPE.WINNER);
            });
          }
        }
      }
    },

    leavingGame(roomId, playerID, failedToReconnect, gameState, teamWon) {
      check(roomId, String);
      check(playerID, Number);
      check(failedToReconnect, Boolean);
      check(gameState, Match.Optional(Match.OneOf(Object, null, undefined)));
      check(teamWon, Match.Optional(Match.OneOf(String, Number, null, undefined)));

      // bbbbb
      // return;

      let isAllMembersQuitted = true;
      try {
        const userId = this.userId; // eslint-disable-line
        // if this user is one of the 2 players, then deactivate room
        const selector = {
          $and: [
            { _id: roomId },
            { isActive: true },
            { playerInfo: { $elemMatch: { userId } } }
          ]
        };
        const fields = {
          isActive: 1,
          playerInfo: 1,
          gameEnded: 1
        };

        const playerInRoomField = `usersInRoom.${playerID}`;
        console.log(`leaving update 1 ${playerInRoomField} ${roomId}`);
        const failedToReconnectField = `playerInfo.${playerID}.failedToReconnect`;
        ActiveGameList.find({ _id: roomId }).forEach((doc) => {
          const newUpdated = {
            $set: {
              [playerInRoomField]: false,
              [failedToReconnectField]: failedToReconnect
            }
          };
          // console.log("doc .host " + doc.host);
          if (userId === doc.host) {
            const nextHostId = getNextHost(playerID, doc.usersInRoom, doc.playerInfo);
            newUpdated['$set']['host'] = nextHostId;
            if (gameState) {
              newUpdated['$set']['gameState'] = gameState;
            }
          }
          ActiveGameList.update(
            { _id: roomId },
            newUpdated
          );
        });
        // console.log(" accountUserSetInGame  ")
        const userIds = [userId];
        Meteor.call('accountUserSetInGame', userIds, null);

        console.log("find room " + JSON.stringify(selector));
        const room = ActiveGameList.findOne(selector, fields);
        // console.log("find room " + JSON.stringify(room));
        if (room) console.log("teamWon " + teamWon + " " + JSON.stringify(room.winners));
        if (room && typeof (teamWon) === 'number' && !room.gameEnded && (!room.winners || (room.winners && room.winners.length === 0))) {
          const winnerIds = [];
          const loserIds = [];
          for (let i = 0; i < room.playerInfo.length; i++) {
            const pi = room.playerInfo[i];
            if (!pi.userId) continue;
            if (pi.teamID == teamWon) { // eslint-disable-line
              if (!winnerIds.includes(pi.userId))
                winnerIds.push(pi.userId);
            } else {
              if (!loserIds.includes(pi.userId))
                loserIds.push(pi.userId);
            }
          }
          setCoins(room, winnerIds, loserIds);
          ActiveGameList.update(
            { _id: roomId },
            {
              $set: {
                gameEnded: true,
                isActive: false,
                winners: winnerIds
              }
            }
          );
          Meteor.call('accountUserSetInGame', [...winnerIds, ...loserIds], null);
        }
        if (room)  console.log(`leaving update 2 ${playerID} ${room.gameEnded} ${room.isActive}`);
        if (room && !room.gameEnded && room.isActive && typeof(teamWon) !== 'number') {
          const leavingPlayer = room.playerInfo.find(pi => pi.slot === playerID);
          if (!leavingPlayer) {
            throw new Meteor.Error('player does not exist!');
          }
          const outsideSlots = [];
          const insideSlots = [];
          const outsideIds = [];
          const insideIds = [];
          const calcOutsideIds = [];
          const calcInsideIds = [];
          const pisLength = room.playerInfo.length;
          const { teamID } = leavingPlayer;
          for (let i = 0; i < pisLength; i++) {
            const pi = room.playerInfo[i];
            if (pi.teamID === teamID) {
              outsideSlots.push(pi.slot);
              if (pi.userId) {
                outsideIds.push(pi.userId);
              }
              if (!pi.failedToReconnect) {
                calcOutsideIds.push(pi.userId);
              }
            } else {
              insideSlots.push(pi.slot);
              if (pi.userId) {
                insideIds.push(pi.userId);
              }
              if (!pi.failedToReconnect) {
                calcInsideIds.push(pi.userId);
              }
            }
          }
          const memberIdsLength = outsideSlots.length;
          for (let i = 0; i < memberIdsLength; i++) {
            const memberSlot = outsideSlots[i];
            if (room.usersInRoom[memberSlot] && room.playerInfo[memberSlot].slotOption !== SLOT_OPTION.ROBOT) {
              isAllMembersQuitted = false;
              break;
            }
          }
          // console.log(`leaving update 3 ${isAllMembersQuitted}`);
          if (isAllMembersQuitted) {
            setCoins(room, calcInsideIds, calcOutsideIds);
            ActiveGameList.update(
              { _id: roomId },
              {
                $set: {
                  gameEnded: true,
                  isActive: false,
                  winners: insideIds
                }
              }
            );
            Meteor.call('accountUserSetInGame', [...insideIds, ...outsideIds], null);
            ActiveGameList.update(
              { _id: roomId },
              {
                $set: {
                  usersInRoom: Array(room.playerInfo.length).fill(false)
                }
              }
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
      return {
        isAllMembersQuitted
      };
    },

    cancelPairing(gameTrack, myPlayerType) {
      check(gameTrack, String);
      check(myPlayerType, String);
      const userId = this.userId; // eslint-disable-line
      WaitingList.remove({ userId, playerType: myPlayerType, TrackName: gameTrack });
    },

    reportAllBallStopped(roomId) {
      check(roomId, String);
      const userId = this.userId; // eslint-disable-line
      let room = ActiveGameList.findOne({ _id: roomId, isActive: true });

      if (room) {
        if (room.playerInfo[0].userId === userId) {
          ActiveGameList.update({ _id: roomId }, { $set: { allballStopped1: true } });
        }
        if (room.playerInfo[1].userId === userId) {
          ActiveGameList.update({ _id: roomId }, { $set: { allballStopped2: true } });
        }
        room = ActiveGameList.findOne({ _id: roomId, isActive: true });

        if (room.allballStopped1 && room.allballStopped2) {
          const newMove = { Type: 'ALLBALLSTOPPED' };
          const newInd = 1 + room.lastInd;
          const actions = room.actions; // eslint-disable-line

          actions.push(newMove);
          const query = {
            lastInd: newInd,
            allballStopped1: false,
            allballStopped2: false,
            actions
          };
          ActiveGameList.update(
            { _id: roomId },
            { $set: query }
          );
        }
      }
    },

    reportPlayerReadyToPlay(roomId) {
      check(roomId, String);
      const userId = this.userId; // eslint-disable-line

      const room = ActiveGameList.findOne(
        {
          _id: roomId,
          isActive: true,
          playerInfo: { $elemMatch: { userId } }
        }
      );

      if (room) {
        if (room.playerInfo[0].userId === userId) {
          ActiveGameList.update({ _id: roomId }, { $set: { 'playerInfo.0.ready': true } });
        } else {
          ActiveGameList.update({ _id: roomId }, { $set: { 'playerInfo.1.ready': true } });
        }
      }
    },
    // New methods startMatchGame of zigvy
    // startMatchGame: create a play with friends gameMatch
    // aiVersion for ai user choose the ai version
    // startMatchGame(gameTrack, player1Id, player2Id, aiVersion) {
    //   check(gameTrack, String);
    //   check(player1Id, String);
    //   check(player2Id, String);
    //   check(aiVersion, Match.Maybe(String));

    //   const players = Meteor.users.find({ _id: { $in: [player1Id, player2Id] } }).fetch();

    //   if (players.length !== 2) {
    //     return;
    //   }

    //   const config = {
    //     userId1: player1Id,
    //     userName1: players[0].username,
    //     playerType1: players[0].roles[0],
    //     userId2: player2Id,
    //     userName2: players[1].username,
    //     playerType2: players[1].roles[0],
    //     playerRating1: -1,
    //     playerRating2: -1,
    //     usersInRoom: [false, false],
    //     offer1: "",
    //     answer1: "",
    //     gameType: 'Practice',
    //     TrackName: gameTrack,
    //     isActive: true,
    //     playerReady1: true,
    //     playerReady2: true,
    //     lastInd: -1,
    //     isPractice: true,
    //     ballPosSnapshot: []
    //   };

    //   if (players[1]._id === player1Id) {
    //     config.userId1 = player2Id;
    //     config.userName1 = players[1].username;
    //     config.playerType1 = players[1].roles[0]; // eslint-disable-line

    //     config.userId2 = player1Id;
    //     config.userName2 = players[0].username;
    //     config.playerType2 = players[0].roles[0]; // eslint-disable-line
    //   }

    //   if (aiVersion) {
    //     config[aiVersion] = aiVersion;
    //   }

    //   ActiveGameList.insert(config);
    // },

    // add new param aiVersion for ai users when select ai version
    startPracticeGame(gameOption, defaultItems) {
      check(gameOption, Match.ObjectIncluding({
        gameId: String,
        playerTypes: [String],
        aiVersion: Match.Maybe(Array),
        isAIUser: Boolean,
        difficulty: String,
        gameRoomId: String
      }));
      check(defaultItems, [String]);
      const userId = this.userId; // eslint-disable-line
      const gameId = gameOption.gameId; // eslint-disable-line

      console.log("startPracticeGame userId " + userId );
      // if user is already in an active game room then return that room id
      const room = ActiveGameList.findOne(
        {
          $and: [
            { gameId },
            { isActive: true },
            {
              $or: [
                { userId1: userId },
                { userId2: userId }
              ]
            }
          ]
        }
      );

      if (room) { // shouldn't be here since we should have deleted that room!
        ActiveGameList.update({ _id: room._id }, { $set: { isActive: false } });
      }

      // Get defaultItems


      // if waiting list not empty, and there is no constraint on who to match,
      // just pick the first one on list

      // create a new game

      const playerInfo = [];
      for (let ind = 0; ind < gameOption.playerTypes.length; ind += 1) {
        const onePlayerInfo = { userId, slot: ind, playerID: userId, username: Meteor.user().username };
        console.log("startPracticeGame player " + ind + " is " + onePlayerInfo.playerID);
        onePlayerInfo.playerType = gameOption.playerTypes[ind];
        onePlayerInfo.teamId = ind < gameOption.playerTypes.length / 2 ? 0 : 1;
        if (gameOption.aiVersion[ind]) {
          onePlayerInfo.aiVersion = gameOption.aiVersion[ind];
        }
        if (gameOption.aiLabel[ind]) {
          onePlayerInfo.aiLabel = gameOption.aiLabel[ind];
        }
        // console.log("startPracticeGame player again " + ind + " is " + onePlayerInfo.playerID);
        const player = Meteor.users.findOne({ _id: onePlayerInfo.playerID });
        // console.log(`startPracticeGame player again ${ind} is ${player.profile.coins}`);
        onePlayerInfo.playerAvatarURL = player.avatar && player.avatar.url ? player.avatar.url : '/images/default_avatar3.jpg';
        if (gameOption.playerTypes[ind] == "AI" && gameOption.aiVersion[ind] == "") {
          onePlayerInfo.playerAvatarURL = '/images/default_avatar3.jpg';
        }
        onePlayerInfo.playerCoins = player.profile.coins;

        onePlayerInfo.defaultItems = defaultItems;
        playerInfo.push(onePlayerInfo);
      }

      const config = {
        playerInfo,
        gameType: gameOption.gameType || 1, // 1 PRACTICE, 2 MATCH, 3 TESTING
        gameId,
        difficulty: gameOption.difficulty,
        isActive: true,
        lastInd: -1,
        isPractice: true,
        ballPosSnapshot: [],
        gameRoomId: gameOption.gameRoomId
      };

      // console.log("creating active game room " + JSON.stringify(config));
      const roomId = ActiveGameList.insert(config);

      GameRoom.update(
        { _id: gameOption.gameRoomId },
        {
          $set: {
            inRoom: roomId
          }
        }
      );

      return roomId;
    },

    markUserAsLeavingRoom(roomId, playerID) {
      check(roomId, String);
      check(playerID, Number);
      const userId = this.userId; // eslint-disable-line
      const room = ActiveGameList.findOne(
        {
          _id: roomId,
          isActive: true,
          playerInfo: { $elemMatch: { userId } }
        }
      );
      if (room) {
        // check if already marked user as leaving!
        if (playerID == 0) { // eslint-disable-line
          ActiveGameList.update({ _id: room._id }, { $set: { user1MayLeave: true } });
        }
        if (playerID == 1) { // eslint-disable-line
          ActiveGameList.update({ _id: room._id }, { $set: { user2MayLeave: true } });
        }
      }
    },

    unmarkUserAsLeavingRoom(roomId, playerID) {
      check(roomId, String);
      check(playerID, Number);
      const userId = this.userId; // eslint-disable-line
      const room = ActiveGameList.findOne(
        {
          _id: roomId,
          isActive: true,
          playerInfo: { $elemMatch: { userId } }
        }
      );
      if (room) {
        // check if already marked user as leaving!
        if (playerID == 0) { // eslint-disable-line
          ActiveGameList.update({ _id: room._id }, { $set: { user1MayLeave: false } });
        }
        if (playerID == 1) { // eslint-disable-line
          ActiveGameList.update({ _id: room._id }, { $set: { user2MayLeave: false } });
        }
      }
    },


    reportEnteringGameRoom(roomId, playerID) {
      check(roomId, String);
      check(playerID, Number);
      const userId = this.userId; // eslint-disable-line
      // console.log("report new user enter room " + playerID + " " + userId);
      const room = ActiveGameList.findOne(
        {
          _id: roomId,
          isActive: true,
          playerInfo: { $elemMatch: { userId } }
        }
      );
      if (room) {
        // check if already marked user as leaving!
        Meteor.defer(() => {
          Meteor.call('accountUserSetInGame', [userId], room._id);
        });

        const setObj = {          
          gameEnded: false,
          
        };

        console.log(` room before setting ${room._id} ${room.usersInRoom}`);

        for (let k=0; k<room.playerInfo.length; k++) {
          console.log("room.playerInfo[k] " + room.playerInfo[k].slot + " " + room.playerInfo[k].userId);
          if (room.playerInfo[k].userId != userId) continue;
          const pid = room.playerInfo[k].slot;
          const playerInRoomField = `usersInRoom.${pid}`;
          console.log("setting in room true: " + playerInRoomField);
          setObj[playerInRoomField] = true;
          setObj.lastUpdateID = pid;
        }

        ActiveGameList.update(
          { _id: room._id },
          {
            $set: setObj
          }
        );


        // Fix: '$set' is empty. You must specify a field like so: {$set: {<field>: ...}}
        // const keydata = {};
        // // keydata[`answer0`] = "";
        // // keydata[`answer1`] = "";
        // // keydata[`offer0`] = "";
        // // keydata[`offer1`] = "";
        // // keydata[`randomupdateseed`] = Math.random();
        // ActiveGameList.update(
        //   {
        //     _id: roomId
        //   },
        //   {
        //     $set: keydata
        //   }
        // );
      }
    },

    joinFriendlyGame(gameTrack, otherUserId, myPlayerType) {
      check(gameTrack, String);
      check(otherUserId, String);
      check(myPlayerType, String);
      const userId = this.userId; // eslint-disable-line
      const myUser = Meteor.user();
      const username = myUser.username; // eslint-disable-line

      let ratingObj = {
        AI: -1, Human: -1
      };
      ratingObj = myUser.Rating[gameTrack];

      let myRating = ratingObj.Human;
      if (myPlayerType === 'AI') {
        myRating = ratingObj.AI;
      }

      // if otherusername is already in waiting list for this user, then start the game
      const room = FriendWaitingList.findOne(
        {
          $and: [
            { TrackName: gameTrack },
            {
              $or: [
                { userId1: otherUserId, userId2: userId },
                { userId1: userId, userId2: otherUserId }
              ]
            }
          ]
        }
      );

      if (room) {
        // other opponent has already created room
        if ((room.userId1 === otherUserId && room.playerReady1)
          || (room.userId2 === otherUserId && room.playerReady2)) {
          // get user name and rating of opponent
          let opponentUserName;
          let opponentRating;
          let opponentPlayerType;
          if (room.userId1 === otherUserId) {
            opponentUserName = room.username1;
            opponentRating = room.userRating1;
            opponentPlayerType = room.userPlayerType1;
          } else {
            opponentUserName = room.username2;
            opponentRating = room.userRating2;
            opponentPlayerType = room.userPlayerType2;
          }

          // Meteor.call('createActiveGame', otherUserId, userId );
          const createdAt = new Date();
          const roomId = ActiveGameList.insert(
            {
              _id: Meteor.uuid(),
              createdAt,
              userId1: userId,
              userName1: username,
              playerType1: myPlayerType,
              playerRating1: myRating,
              userId2: otherUserId,
              userName2: opponentUserName,
              playerType2: opponentPlayerType,
              playerRating2: opponentRating,
              TrackName: gameTrack,
              gameType: 'FriendlyGame',
              usersInRoom: [false, false],
              isActive: true,
              playerReady1: false,
              playerReady2: false,
              lastInd: -1,
              isPractice: false
            }
          );
          FriendWaitingList.remove({ _id: room._id });
          return roomId;
        }
        // most likely I'm changing my player type, so just update the room
        FriendWaitingList.update({ _id: room._id }, {
          TrackName: gameTrack,
          userId1: userId,
          userName1: username,
          userRating1: myRating,
          playerReady1: true,
          playerType1: myPlayerType,
          userId2: otherUserId,
          playerReady2: false
        });
        return '';
      }
      // add my info to FriendWaitingList

      FriendWaitingList.insert({
        TrackName: gameTrack,
        userId1: userId,
        userName1: username,
        userRating1: myRating,
        playerReady1: true,
        playerType1: myPlayerType,
        userId2: otherUserId,
        playerReady2: false
      });
      return '';
      // // no one can be matched, so add this user to WaitingList
    },

    saveInitSignalOffer(roomId, playerID, data) {
      check(roomId, String);
      check(playerID, Number);
      check(data, String);
      const key = `offer${playerID}`;
      const keydata = {};
      keydata[key] = data;
      keydata[`answer${playerID}`] = "newoffer";
      ActiveGameList.update(
        {
          _id: roomId
        },
        {
          $set: keydata
        }
      );
    },

    saveInitSignalOfferForMultiplayer(roomId, offerName, answerName, data) {
      check(roomId, String);
      check(offerName, String);
      check(answerName, String);
      check(data, String);
      const offerField = `connectionInfo.${offerName}`;
      const answerField = `connectionInfo.${answerName}`;
      try {
        ActiveGameList.update(
          {
            _id: roomId
          },
          {
            $set:
            {
              [offerField]: data,
              [answerField]: 'newOffer'
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    },

    saveGameCommand(roomId, playerID, data) {
      check(roomId, String);
      check(playerID, Number);
      check(data, String);
      const room = ActiveGameList.findOne({ _id: roomId });
      if (!room) {
        console.log(`saveGameCommand: can't find room with id ${roomId} and with userId in it ${this.userId}`);
        return;
      }

      const gameCommandHistory = `${playerID};${Date.now()};${data}`;
      // console.log("saving saveGameCommand " + gameCommandHistory);
      ActiveGameList.update(
        { _id: roomId },
        { $push: { gameCommandHistory } }
      );
    },

    resetRoomConnection(roomId) {
      check(roomId, String);
      console.log(`resetting room ${roomId}`);
      const keydata = {};
      keydata["offer1"] = "";
      keydata["answer1"] = "";
      keydata["offer0"] = "";
      keydata["answer0"] = "";
      keydata["reconnectCounter"] = Math.random();
      ActiveGameList.update(
        {
          _id: roomId
        },
        {
          $set: keydata
        }
      );
    },

    saveInitSignalAnswer(roomId, playerID, data) {
      check(roomId, String);
      check(playerID, Number);
      check(data, String);
      const key = `answer${playerID}`;
      const keydata = {};
      keydata[key] = data;
      ActiveGameList.update(
        {
          _id: roomId
        },
        {
          $set: keydata
        }
      );
    },

    saveInitSignalAnswerForMultiplayer(roomId, answerName, data) {
      check(roomId, String);
      check(answerName, String);
      check(data, String);
      try {
        const answerField = `connectionInfo.${answerName}`;
        ActiveGameList.update(
          {
            _id: roomId
          },
          {
            $set: {
              [answerField]: data
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    },

    resetDisconnectedPeerInfo(roomId, asHost, offerName, answerName) {
      check(roomId, String);
      check(asHost, Boolean);
      check(offerName, Match.Optional(Match.OneOf(String, null, undefined)));
      check(answerName, Match.Optional(Match.OneOf(String, null, undefined)));
      // console.log("resetDisconnectedPeerInfo " + asHost);
      try {
        const offerField = `connectionInfo.${offerName}`;
        const answerField = `connectionInfo.${answerName}`;
        ActiveGameList.update(
          {
            _id: roomId
          },
          {
            $set: {
              [answerField]: "",
              [offerField]: "",
              [`randomupdateseed`]: Math.random()
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    },

    // tournament game pairing?
    pairWithOtherPlayer(gameTrack, myPlayerType) {
      check(gameTrack, String);
      check(myPlayerType, String);
      const userId = this.userId; // eslint-disable-line
      const myUser = Meteor.user();
      const username = myUser.username; // eslint-disable-line
      let ratingObj = {
        AI: -1, Human: -1
      };
      switch (gameTrack) {
        case 'Trajectory Pool': ratingObj = myUser.Rating.PathPool; break;
        default: break;
      }

      let myRating = ratingObj.Human;
      if (myPlayerType === 'AI') {
        myRating = ratingObj.AI;
      }

      // if user is already in an active game room then return that room id
      const room = ActiveGameList.findOne(
        {
          $and: [
            { TrackName: gameTrack },
            { isActive: true },
            {
              $or: [
                { userId1: userId },
                { userId2: userId }
              ]
            }
          ]
        }
      );
      if (room) { // shouldn't be here since we should have deleted that room!
        ActiveGameList.update({ _id: room._id }, { $set: { isActive: false } });
      }

      // if waiting list not empty, and there is no constraint on who to match,
      // just pick the first one on list

      const opponent = WaitingList.findOne({ TrackName: gameTrack, userId: { $ne: userId } });
      if (opponent) {
        // create a new game
        WaitingList.remove(opponent._id);
        const roomId = ActiveGameList.insert(
          {
            userId1: userId,
            userName1: username,
            playerType1: myPlayerType,
            userId2: opponent.userId,
            userName2: opponent.username,
            playerType2: opponent.playerType,
            playerRating1: myRating,
            playerRating2: opponent.rating,
            TrackName: gameTrack,
            gameType: 'TournamentGame',
            usersInRoom: [false, false],
            isActive: true,
            playerReady1: false,
            playerReady2: false,
            lastInd: -1,
            isPractice: false
          }
        );
        return roomId;
      }

      // no one can be matched, so add this user to WaitingList
      const w = {
        _id: Meteor.uuid(),
        userId,
        userName: username,
        playerType: myPlayerType,
        rating: myRating,
        TrackName: gameTrack
      };
      WaitingList.insert(w);
      return null;
    }
  });
}
