import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import GameRoomTournamentSections from '../containers/GameRoomTournamentSections.js';
import { USERS } from '../../../../lib/enum';

let title = '';
export default class GameRoomTournamentDetails extends React.Component {
  static propTypes = {
    tournament: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  }
  render() {
    const { tournament, history } = this.props;
    if (tournament.isAIOnly === true) {
      title = USERS.AI_USERS;
    } else if (tournament.isHumanOnly === true) {
      title = USERS.MANUAL_USERS;
    } else title = USERS.ALL_USERS;

    return (
      <div className="tournament--info--wrapper">
        <div className="tournament--info__main">
          <div className="tournament--info__description">
            <div className="description--img">
              <img src="/images/poolscreenicon2.png" width="70" />
            </div>
            <div className="description--detail">
              <div className="description--detail__header">
                <span>{tournament.Name}</span>
              </div>
              <div className="description--detail__time">
                <span>{moment(tournament.startTime).format('MMMM Do YYYY, HH:mma')}</span>
              </div>
              <div className="description--detail__info">
                <span>
                  {tournament.description}
                </span>
              </div>
            </div>
          </div>
        </div>
        <GameRoomTournamentSections
          tournament={tournament}
          currentRating={this.props.currentRating}
          history={history}
          title={title}
        />
      </div>
    );
  }
}

GameRoomTournamentDetails.propTypes = {
  tournament: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

