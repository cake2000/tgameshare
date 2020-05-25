import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import InviteComponent from '../components/InviteComponent.jsx';

export const composer = ({ context, currentUser, gameRoomId }, onData) => {
  const { Collections, Meteor } = context();

  if (Meteor.subscribe('gameRoom.findById', gameRoomId).ready()) {
    const countdown = Collections.Countdown.findOne({ _id: gameRoomId });
    const gameRoomData = Collections.GameRoom.findOne({ _id: gameRoomId });

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
)(InviteComponent);
