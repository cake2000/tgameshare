import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _get from 'lodash/get';
import _ from 'lodash';
import TournamentSectionInfo from '../components/TournamentSectionInfo.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, sectionId, gameId }, onData) => {
  const { Meteor, Collections } = context();
  const getUser = (userId, registeredUserIds) => {
    const user = Meteor.users.findOne({ _id: userId }, {
      fields: { username: 1, profile: 1, playGames: 1 }
    });
    if (user) {
      user.playGames = user.playGames.find(playGame => playGame.gameId === gameId);
      user.playGames.robot = registeredUserIds.find(userData => userData.userId === userId).robotRelease;
      user.playGames.robots = [{_id: "", releaseName: ""}];
      let handler = null;

      if (userId !== Meteor.userId() && user.playGames.robot) {
        handler = Meteor.subscribe('userAICode.getById', user.playGames.robot);
      } else if (userId === Meteor.userId()) {
        handler = Meteor.subscribe('userAICode.getAll', user.playGames.gameId);
      }
      if (handler && handler.ready()) {
        user.playGames.robots = Collections.UserAICodeProd.find(
          {
            userId
          },
          {
            fields: {
              releaseName: 1
            }
          }
        ).fetch();
      }
    }
    return user;
  };
  let tournamentRounds = [];
  let pairsInRounds = [];
  let section = null;
  let playersList = [];
  let playerRanking = 0;
  let tournament = {};
  if (Meteor.subscribe('tournamentRound.item', sectionId).ready()
    && Meteor.subscribe('tournament.fromSectionId', sectionId).ready()
    && Meteor.subscribe('tournamentSection.item', sectionId).ready()) {
    tournamentRounds = Collections.TournamentRound.find(
      { sectionId },
      { sort: { round: 1 } }
    ).fetch();
    section = Collections.TournamentSection.findOne(
      { _id: sectionId },
      {
        fields: {
          name: 1,
          type: 1,
          tournamentId: 1,
          registeredUserIds: 1,
          numberOfRounds: 1,
          currentRound: 1,
          status: 1,
          reward: 1,
          startTime: 1,
          playerGradeLowerBound: 1,
          playerGradeUpperBound: 1,
          announcement: 1,
          point: 1,
          adjPoint: 1
        }
      }
    );

    if (section) {
      tournament = Collections.Tournament.findOne({
        _id: section.tournamentId
      });
      // hack before fix
      // const zipCode = _get(section, 'zipCode');
      // const zipCode = "11021";
      // if (Meteor.subscribe('LocationByZipCode', zipCode).ready()) {
      //   location = Collections.ZipCode.findOne(
      //     { Zipcode: zipCode },
      //     {
      //       fields: {
      //         Zipcode: 1,
      //         City: 1,
      //         State: 1,
      //         Location: 1
      //       }
      //     }
      //   );
      // }
      const userIds = section.registeredUserIds.map(registeredUserIds => registeredUserIds.userId);
      section.registeredUserIds.sort((element1, element2) => element2.point - element1.point);
      playerRanking = section.registeredUserIds.findIndex(player =>
        player.userId === Meteor.userId()
      ) + 1;

      if (Meteor.subscribe('users.register', userIds).ready()) {
        const players = section.registeredUserIds.map((registeredUserId) => {
          return {
            ...getUser(registeredUserId.userId, section.registeredUserIds),
            point: registeredUserId.point,
            adjPoint: registeredUserId.adjPoint || 0,
            registerTime: registeredUserId.registerTime
          };
        });
        playersList = _.orderBy(players, ['adjPoint', 'registerTime', 'playGames.rating'], ['desc', 'asc', 'desc']);
      }

      pairsInRounds = tournamentRounds.map(tournamentRound => tournamentRound.pairs.map((pair) => {
        const players = pair.players.map(player => ({
          ...getUser(player.playerId, section.registeredUserIds),
          point: player.point,
          adjPoint: player.adjPoint
        }));
        return {
          players,
          status: pair.status,
          activeGameListId: pair.activeGameListId
        };
      }));
    }
  }
  onData(null, { tournamentRounds, pairsInRounds, section, playersList, playerRanking, tournament });
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  updateRobotRelease: actions.tournamentSectionInfo.updateRobotRelease
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(TournamentSectionInfo);
