import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GamesBoard from '../components/GamesBoard.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import { MIGRATION_CONST} from '../../../../lib/enum.js';

export const composer = ({ context, history }, onData) => {
  const { Collections, Meteor, LocalState } = context();
  const initState = {
    levelSelected: LocalState.get('GAME_LEVEL') || 'Beginner',
    gameSelected: LocalState.get('GAME_SELECTED'),
    gameRelease: LocalState.get('GAME_RELEASE'),
    gameRoomLink: LocalState.get('GAME_ROOM_LINK') || '/gamesRoomEntry',
    gameMode: LocalState.get('GAME_MODE')
  };

  if (Meteor.user() && Meteor.subscribe('games.list').ready()) {
    const gamesList = Collections.Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.tankGameId, MIGRATION_CONST.match3GameId] } }, { sort: { _id: -1 } }).fetch();

    onData(null, { gamesList, history, initState });
  }
};

export const depsMapper = (context, actions) => ({
  createGameRoom: actions.gamesBoard.createGameRoom,
  selectGame: actions.gamesBoard.selectGame,
  selectLevel: actions.gamesBoard.selectLevel,
  setLinkForGameRoom: actions.gamesBoard.setLinkForGameRoom,
  selectGameRelease: actions.gamesBoard.selectGameRelease,
  selectCurrentSection: actions.gamesBoard.selectCurrentSection,
  clearGameBoardData: actions.gamesBoard.clearGameBoardData,
  updateRobotCodeId: actions.gamesBoard.updateRobotCodeId,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(GamesBoard);
