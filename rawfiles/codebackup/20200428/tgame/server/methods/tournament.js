/* eslint object-shorthand: [2, "consistent"] */
/* eslint no-underscore-dangle: 0 */
/* global Roles */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import EloRank from 'elo-rank';
import moment from 'moment';
import {
  GameRoom, TournamentRound, Tournament, TournamentSection, Notifications, ActiveGameList, Games
} from '../../lib/collections';
import {
  TOURNAMENT_STATUS, TOURNAMENT_SECTION_STATUS, ROLES, POINTS, RATING_FLOOR,
  TOURNAMENT_SECTION_ROUND_STATUS,
  GAME_CONFIG_OPTION, LEVELS, TOURNAMENT_ROUND_STATUS, NOTIFICATION, GAME_TYPE, PLAYER_TYPE, OPPONENTS
} from '../../lib/enum';
import { TIMES } from '../../lib/const';
import { getDetailItemsForUserId } from '../../lib/util';
import { getKFactor } from './gameMasterGameRoom';


const comparePointOnly = (a, b) => {
  return Math.sign(b.point - a.point);
};

const addAdjustedPoint = (rulist, allRounds) => {
  const maxPointLevel = rulist[0].point;
  for (let curPoint = maxPointLevel; curPoint >= 0; curPoint--) {
    // find all users of the same point
    const idmap = {};
    const adjpointmap = {};
    let count = 0;
    for (let k = 0; k < rulist.length; k++) {
      if (rulist[k].point === curPoint) {
        idmap[rulist[k].userId] = 1;
        adjpointmap[rulist[k].userId] = 0;
        count++;
      }
    }

    if (count === 0) continue;
    if (count === 1) {
      for (let k = 0; k < rulist.length; k++) {
        if (rulist[k].point == curPoint) {
          rulist[k].adjPoint = rulist[k].point;
          break;
        }
      }
      continue;
    }
    // calculate point for each user in this point level against each other
    for (let k = 0; k < allRounds.length; k++) {
      const r = allRounds[k];
      for (let j = 0; j < r.pairs.length; j++) {
        const pair = r.pairs[j];
        if (pair.status !== TOURNAMENT_ROUND_STATUS.FINISH) continue;
        if (idmap[pair.players[0].playerId] && idmap[pair.players[1].playerId]) {
          adjpointmap[pair.players[0].playerId] += pair.players[0].point * 0.01;
          adjpointmap[pair.players[1].playerId] += pair.players[1].point * 0.01;
        }
      }
    }

    // add adj point to players
    for (let k = 0; k < rulist.length; k++) {
      if (rulist[k].point == curPoint) {
        rulist[k].adjPoint = rulist[k].point + adjpointmap[rulist[k].userId];
      }
    }
  }
};


const elo = new EloRank();

const updateTournamentSectionStatus = (sectionId, status) => {
  TournamentSection.update(
    { _id: sectionId },
    { $set: { status } }
  );
};

const updateTournamentStatus = (tournamentId, status) => {
  Tournament.update(
    {
      _id: tournamentId
    },
    {
      $set: {
        status: status,
        endTime: status === TOURNAMENT_STATUS.END ? new Date() : null
      }
    }
  );
};

const sendTournamentRegistrationEmail = (tournamentId) => {
  const user = Meteor.users.findOne({ _id: Meteor.userId() });
  const tournament = Tournament.findOne({ _id: tournamentId });
  if (user && tournament) {
    const { profile, emails } = user;
    if (Array.isArray(emails) && emails.length > 0) {
      const email = emails[0].address;
      const { firstName, lastName } = profile;
      const { Name, startTime } = tournament;
      const tournamentStartTime = moment(startTime).format('MMM DD, HH:mm');
      Meteor.defer(() => {
        Email.send({
          from: 'TuringGame <support@tgame.ai>',
          to: email,
          subject: `Tournament registration confirmation`,
          text: `  Hi ${firstName} ${lastName},\n  You have successfully registered for the ${Name}, to be held on ${tournamentStartTime}. We will assign a section for you near the start time of the tournament. On the tournament day,you will need to sign into our platform before the start time. You will be playing 4 to 8 games with different players online from your computer, so please allocate about 3 hours of time for the whole event. Feel free to ask your question on our forum or reply to this email.\n  Thanks, TuringGame admin.`
        });
      });
    }
  }
};

export default function () {
  Meteor.methods({
    'tournament.createInvitation'(sectionId, roundId) {
      check([sectionId, roundId], [String]);
      const section = TournamentSection.findOne({ _id: sectionId });
      const noti = Notifications.findOne({ entityId: roundId });
      if (!noti) {
        const userIds = section.registeredUserIds.map(registeredUserId => registeredUserId.userId);
        const tournament = Tournament.findOne({ _id: section.tournamentId });
        const game = Games.findOne({ _id: tournament.gameId });
        const craftNotiObject = {
          game: {
            name: game.title,
            id: game._id
          },
          entityType: NOTIFICATION.TOURNAMENT_INVITE,
          entityId: roundId,
          sender: {
            type: 'system'
          },
          recipients: userIds,
          actionOnEntity: {
            countdown: (TIMES.START_TOURNAMENT_BEFORE + TIMES.OVERTIME_TOURNAMENT) * 60
          }
        };

        return Meteor.call('notification.generateNoti', craftNotiObject);
      }
      return null;
    },

    'tournament.seen'(notiId) {
      check(notiId, String);
      const notification = Notifications.findOne({ _id: notiId });

      if (notification && !notification.readBy.map(reader => reader.readerId).includes(Meteor.userId())
      ) {
        Notifications.update(
          { _id: notiId },
          {
            $push: {
              readBy: {
                readerId: Meteor.userId(),
                readAt: new Date()
              }
            }
          }
        );
      }
    },

    'tournament.deleteNotification'(notiId) {
      check(notiId, String);
      const notification = Notifications.findOne({ _id: notiId });
      if (notification && !notification.isDelete.map(reader => reader.playerId).includes(Meteor.userId())
      ) {
        Notifications.update(
          { _id: notiId },
          {
            $push: {
              isDelete: {
                playerId: Meteor.userId(),
                deletedAt: new Date()
              }
            }
          }
        );
      }
    },

    'tournament.joinRoom'(roomId, notiId) {
      check([roomId, notiId], [String]);
      const gameRoom = GameRoom.findOne({ _id: roomId });

      if (gameRoom) {
        GameRoom.update(
          {
            _id: roomId,
            'playerInfo.userId': Meteor.userId()
          },
          {
            $set: {
              'playerInfo.$.inRoom': true
            }
          }
        );

        Meteor.users.update({ _id: Meteor.userId() }, { $set: { inRoom: roomId } });
        Meteor.call('tournament.seen', notiId);
        return roomId;
      }
      return null;
    },

    'tournament.leaveRoom'(roomId) {
      check(roomId, String);

      const gameRoom = GameRoom.findOne({ _id: roomId });
      const { userId } = this;

      if (userId) {
        Meteor.users.update({ _id: userId }, { $unset: { inRoom: '' } });
      }

      if (gameRoom && userId) {
        GameRoom.update(
          {
            _id: roomId,
            'playerInfo.teamID': userId
          },
          {
            $set: {
              'playerInfo.$.ready': false
            }
          }
        );
      }
    },

    'tournament.clearRoom'(roomId) {
      check(roomId, String);
      const gameRoom = GameRoom.findOne({ _id: roomId });
      const { userId } = this;

      if (userId) {
        Meteor.users.update({ _id: userId }, { $unset: { inRoom: '' } });
      }

      if (gameRoom && gameRoom.inRoom) {
        GameRoom.remove({ _id: roomId });
      } else if (gameRoom) {
        GameRoom.update(
          {
            _id: roomId,
            'playerInfo.teamID': userId
          },
          {
            $set: {
              'playerInfo.$.ready': false
            }
          }
        );
      }
    },

    'tournament.cancel'(pairData, notiId) {
      check(notiId, String);
      check(pairData, Object);
      const notification = Notifications.findOne({ _id: notiId });
      const round = TournamentRound.findOne({ _id: notification.entityId });

      if (notification && !notification.isDelete.map(reader => reader.playerId).includes(Meteor.userId())
      ) {
        const gameRoom = GameRoom.findOne({ _id: pairData.gameRoomId });
        let opponent = null;

        if (gameRoom) {
          gameRoom.playerInfo = gameRoom.playerInfo.map((member) => {
            if (member.userId === Meteor.userId()) {
              return {
                teamID: member.teamID,
                playerType: GAME_CONFIG_OPTION.DEFAULT,
                userId: member.teamID,
                ready: false,
                cancelTournamentGame: true
              };
            }
            opponent = member;
            return member;
          });
          GameRoom.update({ _id: gameRoom._id }, { $set: gameRoom });
          const notReadyUser = gameRoom.playerInfo.filter(player => player.cancelTournamentGame === true);
          if ((gameRoom.playerInfo.length === 1 && notReadyUser.length === 1)
            || (notReadyUser.length > 1)) {
            Meteor.call('finishTournamentSectionRound', round._id, gameRoom.playerInfo[0].teamID, pairData.id, PLAYER_TYPE.BOTH_LOSER);
          }
        }
        const players = [
          {
            playerId: Meteor.userId(),
            deletedAt: new Date()
          }
        ];

        Meteor.users.update({ _id: Meteor.userId() }, { $unset: { inRoom: '' } });
        const pairPlayers = pairData.players.map((player) => {
          if (player.playerId === Meteor.userId()) {
            return {
              ...player,
              cancelTournament: true
            };
          }

          return player;
        });

        TournamentRound.update(
          {
            _id: round._id,
            'pairs.id': pairData.id
          },
          {
            $set: {
              'pairs.$.players': pairPlayers
            }
          }
        );

        if (opponent && opponent.ready === true) {
          players.push({
            playerId: opponent.userId,
            deletedAt: new Date()
          });
        }

        Notifications.update(
          { _id: notiId },
          {
            $push: {
              isDelete: {
                $each: players
              }
            }
          }
        );
      }
    },

    'tournament.createTournamentGameMatch'(gameOption, notiId, roundId, pairIndex) {
      check(gameOption, Match.ObjectIncluding({
        gameRoomId: String,
        gameId: String,
        difficulty: String,
        playerInfo: [Object],
        aiVersion: Match.Maybe(String),
        owner: String
      }));
      check([notiId, roundId], [String]);
      check(pairIndex, Number);

      // first search if we already created an activegame for this gameroom
      const ag = ActiveGameList.findOne({ gameId: gameOption.gameId, gameRoomId: gameOption.gameRoomId });
      if (ag) {
        return ag._id;
      }

      const config = {
        playerInfo: gameOption.playerInfo,
        gameId: gameOption.gameId,
        gameRoomId: gameOption.gameRoomId,
        difficulty: gameOption.difficulty,
        isActive: true,
        lastInd: -1,
        ballPosSnapshot: [],
        gameType: gameOption.gameType || GAME_TYPE.MATCH,
        owner: gameOption.owner,
        notiId: notiId,
        playerRating1: -1,
        playerRating2: -1,
        usersInRoom: [false, false],
        offer1: "",
        answer1: "",
        isPractice: false
      };

      if (gameOption.aiVersion) {
        config.aiVersion = gameOption.aiVersion;
      }

      const activeGameListId = ActiveGameList.insert(config);

      TournamentRound.update(
        {
          _id: roundId,
          'pairs.id': pairIndex
        },
        {
          $set: {
            'pairs.$.status': TOURNAMENT_ROUND_STATUS.IN_PROGRESS,
            'pairs.$.activeGameListId': activeGameListId
          }
        }
      );
      GameRoom.update({ _id: gameOption.gameRoomId }, { $set: { inRoom: activeGameListId } });
      const players = gameOption.playerInfo.map((player) => {
        return {
          playerId: player.userId,
          deletedAt: new Date()
        };
      });
      Notifications.update(
        { _id: notiId },
        {
          $push: {
            isDelete: {
              $each: players
            }
          }
        }
      );

      return activeGameListId;
    },


    'tournamentParingUsers'(teamList) {
      check(teamList, Array);
      const pairs = [];
      const teams = [...teamList];

      // step 2, sort all teams by their cumPoint and then rating decreasingly
      teams.sort((a, b) => {
        // console.log("comparing " + JSON.stringify(a) + " vs " + JSON.stringify(b));
        if (a.point !== b.point) {
          // console.log("return compare by point " + b.point + "-" + a.point);
          return Math.sign(b.point - a.point);
        }
        // console.log("return compare by rating " + b.rating + "-" + a.rating);
        return Math.sign(b.rating - a.rating);
      });

      // step 3. cut teams into groups of the same score
      // if there are odd number of players in a group, take top player from
      // lower-scored players

      const teamGroupsBypoint = [];
      let onegroup = [];
      let currentCumPoint = teams[0].point;
      for (let ti = 0; ti < teams.length; ti++) {
        const t = teams[ti];
        if (t.point === currentCumPoint) {
          onegroup.push(t);
        } else if (onegroup.length % 2 === 0) {
          teamGroupsBypoint.push(onegroup);
          onegroup = [t];
          currentCumPoint = t.point;
        } else {
          onegroup.push(t);
          teamGroupsBypoint.push(onegroup);
          onegroup = [];
          if (ti < teams.length - 1) {
            currentCumPoint = teams[ti + 1].point;
          }
        }
      }
      if (onegroup.length > 0) {
        teamGroupsBypoint.push(onegroup);
      }

      // step 4. if there are odd number of teams for last group, take one team out as BYE
      const lastGroup = teamGroupsBypoint[teamGroupsBypoint.length - 1];
      if (lastGroup.length % 2 === 1) {
        // pick lowest ranking team if it hasn't got BYE yet
        let foundBYETeam = false;
        for (let k = lastGroup.length - 1; k >= 0; k--) {
          if (!lastGroup[k].hasBYE) {
            lastGroup[k].hasBYE = true;
            lastGroup[k].isBYE = true;
            const pair = {
              team1: lastGroup[k]
            };
            pairs.push(pair);
            lastGroup.splice(k, 1);
            foundBYETeam = true;
            break;
          }
        }

        if (!foundBYETeam) {
          // if number of teams really small, then this might happen, then
          // we have to BYE the last team even though it has BYE before already.
          lastGroup[lastGroup.length - 1].hasBYE = true;
          lastGroup[lastGroup.length - 1].isBYE = true;
          const pair = {
            team1: lastGroup[lastGroup.length - 1]
          };
          pairs.push(pair);
          lastGroup.splice(lastGroup.length - 1, 1);
        }
      }


      // step 5, for each score group, split teams into 2 halves and match them 1 by 1

      for (let gi = 0; gi < teamGroupsBypoint.length; gi++) {
        onegroup = teamGroupsBypoint[gi];
        const cnt = (onegroup.length) / 2;

        for (let i = 0; i < cnt; i++) {
          const pair = {
            team1: onegroup[i], team2: onegroup[i + cnt]
          };
          // console.log("adding pair to pairs: " + pair.team1.teamId + " " + pair.team2.teamId);
          pairs.push(pair);
        }
      }

      // handle duplicate opponent situations:
      const swapToRemoveDuplicate = () => {
        // console.log(`swapping to remove duplciations run ${iteration}`);
        for (let k = 0; k < pairs.length - 1; k++) {
          const p = pairs[k];
          const np = pairs[k + 1];
          if (p.team1 && p.team2) {
            if (p.team1.prevOpponentTeamsInThisTournament
              && p.team1.prevOpponentTeamsInThisTournament.indexOf(p.team2.userId) >= 0) {
              // we have a duplicate -> swap with next pair
              // console.log(`\n!!swapping between pair ${p.team1.teamId}
              // / ${p.team2.teamId} and pair ${np.team1.teamId} / ${np.team2.teamId}`);
              const tmp = p.team2;
              p.team2 = np.team2;
              np.team2 = tmp;
            }
          }
        }
      };

      swapToRemoveDuplicate();
      swapToRemoveDuplicate();
      swapToRemoveDuplicate();
      swapToRemoveDuplicate();
      swapToRemoveDuplicate();


      // store final pairing into prevOpponentTeamsInThisTournament
      // also assign a first mover based on history
      for (let k = 0; k < pairs.length - 1; k++) {
        const p = pairs[k];
        if (p.team1 && p.team2) {
          p.team1.prevOpponentTeamsInThisTournament += p.team2.userId;
          p.team2.prevOpponentTeamsInThisTournament += p.team1.userId;

          if (p.team1.firstMoveCount > p.team2.firstMoveCount) {
            p.team1.isFirstMove = false;
            p.team2.isFirstMove = true;
          } else if (p.team1.firstMoveCount < p.team2.firstMoveCount) {
            p.team1.isFirstMove = true;
            p.team2.isFirstMove = false;
          } else { // equal, then randomly choose
            const rnd = Math.random();
            if (rnd >= 0.5) {
              p.team1.isFirstMove = true;
              p.team2.isFirstMove = false;
            } else {
              p.team1.isFirstMove = false;
              p.team2.isFirstMove = true;
            }
          }

          if (p.team1.isFirstMove) {
            p.team1.firstMoveCount++;
          }
          if (p.team2.isFirstMove) {
            p.team2.firstMoveCount++;
          }
        }
      }
      return pairs;
    },

    'tournamentUpdateUsersRating'(teamList, sectionId, gameId) {
      check([sectionId, gameId], [String]);
      check(teamList, Array);
      const AllRounds = TournamentRound.find({ sectionId }).fetch().map(round => round.pairs);
      for (let t = 0; t < teamList.length; t++) {
        const team = teamList[t];
        const k = getKFactor(team.rating);
        elo.setKFactor(k);

        // to use the Elo system, we just need total expected points and actual points
        let expectedPoints = 0;
        let actualPoints = 0;

        for (let r = 0; r < AllRounds.length; r++) {
          const pairs = AllRounds[r];
          for (let pi = 0; pi < pairs.length; pi++) {
            const p = pairs[pi];
            // console.log("p " + JSON.stringify(pairs));
            let otherTeam = null; let result = -1;
            if (p.players[0].playerId === team.userId) {
              if (p.players[1].playerId) {
                otherTeam = p.players[1];
                const user = Meteor.users.findOne({ _id: p.players[1].playerId });
                otherTeam.rating = user.playGames.find(playGame => playGame.gameId === gameId).rating;
              }
              result = p.players[0].point;
            }
            if (p.players[1].playerId === team.userId) {
              if (p.players[0].playerId) {
                otherTeam = p.players[0];
                const user = Meteor.users.findOne({ _id: p.players[0].playerId });
                otherTeam.rating = user.playGames.find(playGame => playGame.gameId === gameId).rating;
              }
              result = 1 - p.players[0].point;
            }
            if (otherTeam !== null) {
              expectedPoints += elo.getExpected(team.rating, otherTeam.rating);
              actualPoints += result;
            }
          }
        }
        team.newRating = elo.updateRating(expectedPoints, actualPoints, team.rating);
        if (team.newRating < RATING_FLOOR) team.newRating = RATING_FLOOR;

        // console.log(`${team.userId} expected ${expectedPoints} actual ${actualPoints}
        // rating: ${team.rating} -> ${team.newRating}`);

        Meteor.users.update(
          {
            _id: team.userId,
            'playGames.gameId': gameId
          },
          {
            $set: {
              'playGames.$.rating': team.newRating
            }
          }
        );
      }
    },

    'tournamentUpdatePairStatus'(status) {
      check(status, String);
      if (this.userId) {
        const currentUser = Meteor.users.findOne({ _id: this.userId });
        if (currentUser.confirmObject) {
          const { confirmObject } = currentUser;
          const tournamentRoundData = TournamentRound.find(
            {
              sectionId: confirmObject.sectionId,
              round: confirmObject.round
            }
          ).fetch();

          _.map(tournamentRoundData.pairs, (pair, index) => {
            if (pair.id === confirmObject.pairIndex) {
              tournamentRoundData.pairs[index].status = status;
            }
          });
          TournamentRound.update(
            {
              sectionId: confirmObject.sectionId,
              round: confirmObject.round
            },
            {
              $set: {
                pairs: tournamentRoundData.pairs
              }
            }
          );
        }
      }
    },

    // update each player's cum poitns and the finished pair count for each round
    'updateSectionCumStat'(sid) {
      check(sid, String);
      const allRounds = TournamentRound.find({ sectionId: sid }).fetch();
      // console.log("allrounds " + JSON.stringify(pairs));
      const section = TournamentSection.findOne({ _id: sid });
      const rulist = section.registeredUserIds;
      const userPoints = {};
      for (let k = 0; k < allRounds.length; k++) {
        const r = allRounds[k];
        let finishedPairs = 0; // numberOfFinishPairs

        for (let j = 0; j < r.pairs.length; j++) {
          const pair = r.pairs[j];
          if (pair.status !== TOURNAMENT_ROUND_STATUS.FINISH) continue;

          finishedPairs++;

          for (let x = 0; x < 2; x++) {
            const p = pair.players[x];
            if (typeof (userPoints[p.playerId]) === "undefined") userPoints[p.playerId] = 0;
            userPoints[p.playerId] += p.point;
          }
        }
        // update numberOfFinishPairs
        TournamentRound.update(
          { _id: r._id },
          { $set: { numberOfFinishPairs: finishedPairs } }
        );
      }

      // update cum points for all users in section
      for (let i = 0; i < rulist.length; i++) {
        rulist[i].point = userPoints[rulist[i].userId];
        if (typeof (rulist[i].point) === "undefined") rulist[i].point = 0;
      }

      // sort users by point only, then calculate AdjustedPoint for tied players
      // based on points they got against each other in that tie group
      rulist.sort(comparePointOnly);
      addAdjustedPoint(rulist, allRounds);
      TournamentSection.update(
        {
          _id: section._id
        },
        {
          $set: {
            registeredUserIds: rulist
          }
        }
      );
    },

    'finishTournamentSectionRound'(roundId, playerId, pairIndex, typeOfPlayer) {
      check([roundId, playerId, typeOfPlayer], [String]);
      check(pairIndex, Number);

      const tournamentRound = TournamentRound.findOne({ _id: roundId });
      // const allRounds = TournamentRound.findOne({ sectionId: tournamentRound.sectionId });
      const section = TournamentSection.findOne({ _id: tournamentRound.sectionId });
      // Check if the result is updated
      // const setPoint = (registeredUserIds, player1, player2) => {
      //   return registeredUserIds.map((registeredUserId) => {
      //     if (registeredUserId.userId === player1.playerId) {
      //       registeredUserId.point += player1.point; // eslint-disable-line no-param-reassign
      //     } else if (registeredUserId.userId === player2.playerId) {
      //       registeredUserId.point += player2.point; // eslint-disable-line no-param-reassign
      //     }
      //     return registeredUserId;
      //   });
      // };
      // if (tournamentRound && tournamentRound.pairs) {
      //   // console.log("\n\n\n\ndddd before changing round pair " + roundId + " " + pairIndex + JSON.stringify(tournamentRound.pairs));
      // }

      if (section && tournamentRound && tournamentRound.pairs && tournamentRound.pairs[pairIndex]
        && tournamentRound.pairs[pairIndex].status !== TOURNAMENT_ROUND_STATUS.FINISH
      ) {
        const pairData = tournamentRound.pairs[pairIndex];
        // Update result in tournament round record
        if (typeOfPlayer === PLAYER_TYPE.BOTH_LOSER) {
          pairData.players[0].point = POINTS.LOSE;
          pairData.players[1].point = POINTS.LOSE;
          // section.registeredUserIds = setPoint(section.registeredUserIds, pairData.players[0], pairData.players[1]);
        } else if ((pairData.players[0].playerId === playerId
          && typeOfPlayer === PLAYER_TYPE.LOSER) || (pairData.players[1].playerId === playerId
            && typeOfPlayer === PLAYER_TYPE.WINNER)) {
          pairData.players[0].point = POINTS.LOSE;
          pairData.players[1].point = POINTS.WIN;
          // section.registeredUserIds = setPoint(section.registeredUserIds, pairData.players[0], pairData.players[1]);
        } else {
          pairData.players[0].point = POINTS.WIN;
          pairData.players[1].point = POINTS.LOSE;
          // section.registeredUserIds = setPoint(section.registeredUserIds, pairData.players[1], pairData.players[0]);
        }

        TournamentSection.update(
          {
            _id: section._id
          },
          {
            $set: {
              registeredUserIds: section.registeredUserIds,
              status: TOURNAMENT_SECTION_ROUND_STATUS(section.currentRound).COMPLETED
            }
          }
        );

        const roomId = tournamentRound.pairs[pairIndex].gameRoomId;
        const noti = Notifications.findOne({ entityId: roundId });
        if (noti) { Meteor.call('gameRoom.delete', roomId, noti._id || ''); }

        // Update status of pair
        pairData.status = TOURNAMENT_ROUND_STATUS.FINISH;

        // Update number of finish pair
        // tournamentRound.numberOfFinishPairs += 1;

        tournamentRound.pairs[pairIndex] = pairData;
        TournamentRound.update(
          { _id: roundId },
          {
            $set: {
              pairs: tournamentRound.pairs
            // numberOfFinishPairs: tournamentRound.numberOfFinishPairs
            }
          }
        );
        Meteor.defer(() => {
          Meteor.call('updateSectionCumStat', section._id);
        });
      }
    },

    'startTournamentSectionRound'(sectionId, gameId) {
      check([sectionId, gameId], [String]);
      const section = TournamentSection.findOne({ _id: sectionId });
      const tournament = Tournament.findOne({ _id: section.tournamentId });
      const currentRound = section.currentRound + 1;
      let notiId = '';
      // Check if this is the last round, finish the tournament section

      if (currentRound > section.numberOfRounds) {
        // Update status of tournament section to finish
        Meteor.defer(() => {
          updateTournamentSectionStatus(sectionId, TOURNAMENT_SECTION_STATUS.END);
          Meteor.call('finishSection', section.registeredUserIds, section._id, gameId);
        });
        const userIds = section.registeredUserIds.map(registeredUserId => registeredUserId.userId);
        const craftNotiObject = {
          message: { sectionName: section.name, tournamentName: tournament.Name },
          entityType: NOTIFICATION.FINISH_TOURNAMENT,
          entityId: section._id,
          sender: {
            type: 'system'
          },
          recipients: userIds,
          actionOnEntity: {}
        };
        Meteor.defer(() => {
          Meteor.call('notification.generateNoti', craftNotiObject);
        });

        // Check if all sections are finished, finish tournament
        const pendingSection = TournamentSection.find(
          {
            tournamentId: section.tournamentId,
            status: { $ne: TOURNAMENT_SECTION_STATUS.END }
          }
        ).fetch();
        if (pendingSection && pendingSection.length === 0) {
          Meteor.defer(() => {
            Meteor.call('finishTournament', section.tournamentId);
          });
        }
        return false;
      }

      const registeredUserIds = section.registeredUserIds;
      if (registeredUserIds.length === 0) {
        // Change status of tournament section to finish if no user join this section
        updateTournamentSectionStatus(sectionId, TOURNAMENT_SECTION_STATUS.END);
        return false;
      }

      // Change status of tournament section
      updateTournamentSectionStatus(sectionId, TOURNAMENT_SECTION_ROUND_STATUS(currentRound).UNDERWAY);

      // Pairing users
      const userPairs = Meteor.call('tournamentParingUsers', section.registeredUserIds);
      const pairData = [];

      // For each pair:
      _.map(userPairs, (pair, index) => {
        // Create gameroom for 2 users to join
        const playerInfo = [];
        const aiPlayers = [];
        _.map(pair, (user, jindex) => {
          if (user) {
            const currentUser = Meteor.users.findOne({ _id: user.userId });

            playerInfo.push({
              teamID: jindex.replace('team', '') - 1,
              playerType: Roles.userIsInRole(user.userId, ROLES.AI) ? GAME_CONFIG_OPTION.AI
                : GAME_CONFIG_OPTION.HUMAN,
              userId: currentUser._id,
              defaultItems: getDetailItemsForUserId(currentUser._id),
              ready: false
            });
            if (Roles.userIsInRole(user.userId, ROLES.AI)) {
              aiPlayers.push(user.userId);
            }
          } else {
            playerInfo.push({
              teamID: '',
              playerType: GAME_CONFIG_OPTION.HUMAN,
              userId: '',
              defaultItems: [],
              ready: false
            });
          }
        });
        // Create gameroom and get gameroomId for user to join
        const gameData = {
          owner: pair.team1.userId,
          gameId: gameId,
          level: LEVELS.BEGINNER,
          mode: OPPONENTS.TOURNAMENT.name,
          playerInfo: playerInfo,
          isTournament: true
        };
        const gameRoomId = Meteor.call('gameRoomTournament.create', gameData);
        Meteor.defer(() => {
          aiPlayers.map(userId => Meteor.call('gameRoom.updateAIListForUserId', gameRoomId, userId));
        });

        // Get pair data to insert into tournament round collection
        pairData.push({
          id: index,
          players: [
            {
              playerId: pair.team1.userId,
              point: null
            },
            {
              playerId: pair.team2 ? pair.team2.userId : null,
              point: null
            }
          ],
          activeGameListId: null,
          gameRoomId: gameRoomId,
          status: TOURNAMENT_ROUND_STATUS.WAITING
        });
      });
      // Create tournament round
      const tournamentRoundData = {
        sectionId: section._id,
        tournamentId: section.tournamentId,
        numberOfPairs: userPairs.length,
        numberOfFinishPairs: 0,
        round: currentRound,
        pairs: pairData
      };

      const roundId = TournamentRound.insert(tournamentRoundData);
      notiId = Meteor.call('tournament.createInvitation', sectionId, roundId);
      Meteor.defer(() => {
        Meteor.call('notification.gameRoundCountdown', notiId);
      });

      // Update current round of tournament section
      TournamentSection.update(
        { _id: section._id },
        { $set: { currentRound } }
      );

      return null;
    },

    'startTournament'(tournament) {
      check(tournament, Object);
      const tournamentId = tournament._id;

      // Change status of tournament
      updateTournamentStatus(tournamentId, TOURNAMENT_STATUS.IN_PROGRESS);

      // Get all tournament sections
      const tournamentSections = TournamentSection.find(
        { tournamentId },
        { fields: { _id: 1, registeredUserIds: 1, tournamentId: 1 } }
      ).fetch();
      Meteor.defer(() => {
        _.map(tournamentSections, (section) => {
          Meteor.call('startTournamentSectionRound', section._id, tournament.gameId);
        });
      });
    },

    'finishTournament' (tournamentId) {
      check(tournamentId, String);
      // Update status tournament
      updateTournamentStatus(tournamentId, TOURNAMENT_STATUS.END);
    },

    'finishSection'(teamList, sectionId, gameId) {
      check([sectionId, gameId], [String]);
      check(teamList, Array);
      // Update section status
      Meteor.call('tournamentUpdateUsersRating', teamList, sectionId, gameId);
    },

    'tournament.viewResult' (sectionId) {
      check(sectionId, String);
      const section = TournamentSection.findOne({ _id: sectionId });
      const tournament = Tournament.findOne({ _id: section.tournamentId });

      return tournament;
    },

    'tournament.joinSection'(tournamentId, sectionId, userData, robotRelease) {
      check(tournamentId, String);
      check(sectionId, String);
      check(userData, Object);
      check(robotRelease, String);

      try {
        Meteor.defer(() => {
          Meteor.call('accountsUpdateUserData', userData);
        });
        const tournament = Tournament.findOne({ _id: tournamentId });
        const {
          gameId
        } = tournament;
        const rating = Meteor.user().playGames.filter(game => game.gameId === gameId)[0].rating;
        const playerInfo = {
          userId: userData._id,
          hasBYE: false,
          isBYE: false,
          rating: rating,
          isFirstMove: false,
          firstMoveCount: 0,
          registerTime: new Date(),
          robotRelease: robotRelease
        };
        const isExisted = TournamentSection.find({
          tournamentId: tournamentId,
          registeredUserIds: {
            $elemMatch: {
              userId: userData._id
            }
          }
        }).count() > 0;
        if (isExisted) {
          throw new Meteor.Error('join-section', 'Player already exists!');
        } else {
          TournamentSection.update({ _id: sectionId }, { $push: { registeredUserIds: playerInfo } });
          sendTournamentRegistrationEmail(tournamentId);
        }
      } catch (error) {
        throw new Meteor.Error('join-section', error);
      }
    },

    'tournament.withdrawSection' (sectionId, userId) {
      check(sectionId, String);
      check(userId, String);
      const isExisted = TournamentSection.findOne({
        _id: sectionId,
        registeredUserIds: {
          $elemMatch: {
            userId: userId
          }
        }
      });
      if (isExisted) {
        TournamentSection.update({ _id: sectionId }, { $pull: { registeredUserIds: { userId } } });
      } else {
        throw new Meteor.Error('withdraw-section', 'Player does not exist.');
      }
    },

    'updateRobotRelease'(robot, sectionId) {
      check(robot, String);
      check(sectionId, String);

      TournamentSection.update(
        {
          _id: sectionId,
          'registeredUserIds.userId': Meteor.userId()
        },
        {
          $set: {
            'registeredUserIds.$.robotRelease': robot
          }
        }
      );
    }
  });
}

