import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import InviteModal from '../components/InviteModal.jsx';

export const composer = ({ context, currentUser }, onData) => {
  const { Collections, Meteor } = context();

  if (currentUser &&
    currentUser.invite &&
    Meteor.subscribe('countdownInvite', currentUser.invite).ready() &&
    Meteor.subscribe('gameRoom.findById', currentUser.invite).ready()) {
    const countdown = Collections.Countdown.findOne({ _id: currentUser.invite });
    const gameRoomData = Collections.GameRoom.findOne({ _id: currentUser.invite });
    if (gameRoomData) {
      const game = Collections.Games.findOne({ _id: gameRoomData.gameId });
      const owner = Meteor.users.findOne({ _id: gameRoomData.owner });

      onData(null, { gameRoomData, countdown, game, owner });
    }
  }
};

export const depsMapper = (context, actions) => ({
  accept: actions.invite.accept,
  decline: actions.invite.decline,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(InviteModal);
