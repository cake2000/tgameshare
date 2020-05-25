import React from 'react';
import GameRoomTournamentData from '../containers/GameRoomTournamentData.js';
// import PropTypes from 'prop-types';
import Banner from '../../core/components/Banner.jsx';

const GameRoomTournament = (props) => {
  return (
    <div className="container page--gamesroom">
      <Banner title="Tournaments" />
      <GameRoomTournamentData
        gameId={props.gameId}
        history={props.history}
      />
    </div>
  );
};

export default GameRoomTournament;
