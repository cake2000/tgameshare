/* global Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import moment from 'moment';
import GameRoomTournamentRegisteredModal from '../components/GameRoomTournamentRegisteredModal.jsx';
import { ROLES } from '../../../../lib/enum';
import { TIMES } from '../../../../lib/const';

export const composer = ({ context,
                           tournamentId,
                           sectionKey,
                           startTime,
                           isAIOnly,
                           isHumanOnly,
                           gameId }, onData) => {
  const { Meteor, Collections } = context();
  let section = null;
  let users = null;
  let usersRating = null;
  let isExisted = true;
  const minutesRemain = moment(moment(startTime)).diff(new Date(), 'minutes') + 1;
  const isAbleToWithdraw = (minutesRemain < TIMES.CANNOT_RES_WITHDRAW_TOURNAMENT_BEFORE
     && minutesRemain > 0);
  const enabledButton = ((Roles.userIsInRole(Meteor.userId(), ROLES.AI) === true
    && isAIOnly === true) || (Roles.userIsInRole(Meteor.userId(), ROLES.MANUAL) === true
    && isHumanOnly === true) || (isHumanOnly === false && isAIOnly === false));
  const userGame = Meteor.user().playGames.find(playGame => playGame.gameId === gameId);

  if (Meteor.subscribe('tournamentSection.item', sectionKey).ready()) {
    section = Collections.TournamentSection.findOne({ _id: sectionKey });
    const userIds = section.registeredUserIds.map(registeredUserIds => registeredUserIds.userId);
    if (section && section.registeredUserIds && Meteor.subscribe('users.register', userIds).ready()) {
      users = section.registeredUserIds.map(registeredUserId =>
        Meteor.users.findOne({ _id: registeredUserId.userId })
      );
      usersRating = users.map(user => user.playGames.find(game => game.gameId === gameId));
    }
    isExisted = section.registeredUserIds.every(registeredUserId =>
      registeredUserId.userId !== Meteor.userId()
    );
  }
  onData(null, {
    users,
    tournamentId,
    isExisted,
    isAbleToWithdraw,
    minutesRemain,
    section,
    enabledButton,
    userGame,
    usersRating
  });
};

export const depsMapper = (context, actions) => ({
  registerUser: actions.gameRoom.registerUser,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameRoomTournamentRegisteredModal);
