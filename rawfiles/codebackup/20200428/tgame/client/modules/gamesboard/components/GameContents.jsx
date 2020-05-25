import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import GameLevel from './GameLevel.jsx';
import GameMode from './GameMode.jsx';
import GameMultiplayer from './GameMultiplayer.jsx';
import { MIGRATION_CONST, OPPONENTS } from '../../../../lib/enum.js';

export default class GameContents extends React.Component {
  static propTypes = {
    levelSelected: PropTypes.string,
    gameSelected: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectLevel: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    selectOpponent: PropTypes.func.isRequired,
    gameMode: PropTypes.string.isRequired,
    selectGame: PropTypes.func.isRequired,
    gamesRelease: PropTypes.array // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    gamesRelease: null,
    levelSelected: 'Beginner',
    gameSelected: null
  }

  componentDidMount() {
    // const { gamesRelease, setError } = this.props;
    // if (Roles.userIsInRole(Meteor.userId(), ROLES.AI) && gamesRelease.length === 0) {
    //   setError('NOT_RELEASE');
    // }
  }

  componentDidUpdate() {
    // if (Roles.userIsInRole(Meteor.userId(), ROLES.AI) && this.props.gamesRelease && this.props.gamesRelease.length === 0) {
    //   const { setError } = this.props;

    //   setError('NOT_RELEASE');
    // }
  }

  render() {
    const {
      gameSelected, levelSelected, gameMode, error, showWarningModal, history, selectLevel, selectOpponent,
      selectMultiplayer, selectGame
    } = this.props;
    const isGamePool = !!(gameSelected._id === MIGRATION_CONST.poolGameId);
    const isMultiMode = _.get(gameSelected, 'multiplayerMode.length') > 1 && gameMode !== OPPONENTS.PLAYERNETWORK.name;

    return (
      <div className="gamesboard__config__container">
        <GameMode
          isGamePool={isGamePool}
          opponents={gameSelected.opponent}
          levelSelected={levelSelected}
          selectOpponent={selectOpponent}
          gameMode={gameMode}
          selectGame={selectGame}
          history={history}
        />
        { isMultiMode && (
        <GameMultiplayer
          isGamePool={isGamePool}
          options={gameSelected.multiplayerMode}
          teamSize={gameSelected.teamSize}
          selectOption={selectMultiplayer}
          error={error}
          selectGame={selectGame}
        />
        )}
        <GameLevel
          isGamePool={isGamePool}
          levels={gameSelected.level}
          levelSelected={levelSelected}
          selectLevel={selectLevel}
          error={error}
          showWarningModal={showWarningModal}
          history={history}
          gameMode={gameMode}
        />
      </div>
    );
  }
}
