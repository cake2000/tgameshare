import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import GameRoomTournamentRegisteredModalContent from '../components/GameRoomTournamentRegisteredModalContent.jsx';

export const composer = ({ context, clearErrors, tournament }, onData) => {
  const { Collections } = context();
  const userData = Meteor.user();
  let userAICodes = [];

  if (Meteor.subscribe('userAICode.getAll', tournament.gameId).ready()) {
    userAICodes = Collections.UserAICodeProd.find(
      {
        userId: Meteor.userId(),
        gameId: tournament.gameId
      },
      {
        fields: {
          userId: 1,
          gameId: 1,
          releaseName: 1
        }
      }
    ).fetch();
  }

  onData(null, { userData, userAICodes });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  resetPassword: actions.account.resetPassword,
  updateUserAction: actions.account.updateUser,
  uploadUserAvatarAction: actions.account.uploadUserAvatar,
  setDefaultCard: actions.account.setDefaultCard,
  removeCard: actions.account.removeCard,
  joinTournamentSection: actions.gameRoom.joinTournamentSection,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(GameRoomTournamentRegisteredModalContent);
