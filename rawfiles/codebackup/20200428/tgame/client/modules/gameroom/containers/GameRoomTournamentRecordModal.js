import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GameRoomTournamentRecordModal from '../components/GameRoomTournamentRecordModal.jsx';

export const composer = ({ context, sectionKey, gameId }, onData) => {
  const { Meteor, Collections } = context();
  const getUser = (userId) => {
    const user = Meteor.users.findOne({ _id: userId }, {
      fields: { username: 1, profile: 1, playGames: 1 }
    });
    if (user) {
      user.playGames = user.playGames.find(playGame => playGame.gameId === gameId);
    }
    return user;
  };
  let tournamentRounds = [];
  let pairsInRounds = [];
  let section = null;
  let playersList = [];
  let playerRanking = 0;

  if (Meteor.subscribe('tournamentRound.item', sectionKey).ready()
    && Meteor.subscribe('tournamentSection.item', sectionKey).ready()) {
    tournamentRounds = Collections.TournamentRound.find(
      { sectionId: sectionKey },
      { sort: { round: 1 } }
    ).fetch();
    section = Collections.TournamentSection.findOne(
      { _id: sectionKey },
      {
        fields: {
          name: 1,
          type: 1,
          registeredUserIds: 1,
          numberOfRounds: 1,
          currentRound: 1,
          status: 1,
          reward: 1
        }
      }
    );
    const userIds = section.registeredUserIds.map(registeredUserIds => registeredUserIds.userId);
    section.registeredUserIds.sort((element1, element2) => element2.point - element1.point);
    playerRanking = section.registeredUserIds.findIndex(player =>
      player.userId === Meteor.userId()
    ) + 1;

    if (Meteor.subscribe('users.register', userIds).ready()) {
      playersList = section.registeredUserIds.map((registeredUserId) => {
        return {
          profile: getUser(registeredUserId.userId),
          point: registeredUserId.point
        };
      });
    }

    pairsInRounds = tournamentRounds.map((tournamentRound) => {
      return (
        tournamentRound.pairs.map((pair) => {
          const playerIds = pair.players.map((player) => {
            if (player.playerId) {
              return player.playerId;
            }
            return '';
          });
          let players = [];
          if (Meteor.subscribe('users.register', playerIds).ready()) {
            players = playerIds.map((playerId) => {
              return getUser(playerId);
            });
          }
          return {
            players,
            status: pair.status
          };
        }
      ));
    });
  }
  onData(null, { tournamentRounds, pairsInRounds, section, playersList, playerRanking });
};

export const depsMapper = (context, actions) => ({
  registerUser: actions.gameRoom.registerUser,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameRoomTournamentRecordModal);
