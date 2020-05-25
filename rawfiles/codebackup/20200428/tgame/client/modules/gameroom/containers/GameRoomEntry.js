import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _get from 'lodash/get';
import GameRoomEntry from '../components/GameRoomEntry.jsx';
import { MIGRATION_CONST } from '../../../../lib/enum.js';

export const composer = ({ context, history }, onData) => {
  const { Meteor, Collections } = context();
  const userId = Meteor.userId();
  if (!userId) {
    history.push('/');
  }
  if (Meteor.subscribe('gameRoom.findByOwner', userId).ready()) {
    const gameRoomData = Collections.GameRoom.findOne({ owner: userId });
    if (gameRoomData) {
      const game = Collections.Games.findOne({ _id: gameRoomData.gameId });
      const defaultItems = _get(gameRoomData, 'playerInfo[0].defaultItems');
      // limit items to each game!
      // if (gameRoomData.gameId == MIGRATION_CONST.match3GameId) {
      //   defaultItems = defaultItems.filter(e => e.indexOf("ma") == 0);
      // }

      if (Meteor.subscribe('UserAICodeProd', game._id, 'Standard').ready()) {
        const gamesRelease = Collections.UserAICodeProd.find({
          userId, gameId: game._id, SubTrackName: 'Standard'
        }, { sort: { releasedAt: -1 } }).fetch();

        onData(null, {
          gamesRelease, gameRoomData, game, defaultItems, isGamePool: gameRoomData.gameId === MIGRATION_CONST.poolGameId
        });
      }
    } else {
      // debugger;
      console.log("go back to /gamesBoard");
      history.push('/gamesBoard');
    }
  } else {
    onData(null, { loading: true });
  }
};

export const depsMapper = (context, actions) => ({
  invitePlayer: actions.gameRoom.invitePlayer,
  clearGameRoomNoNotiId: actions.gameRoom.clearGameRoomNoNotiId,
  createGame: actions.gameRoom.createGame,
  switchTeam: actions.gameRoom.switchTeam,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(GameRoomEntry);
