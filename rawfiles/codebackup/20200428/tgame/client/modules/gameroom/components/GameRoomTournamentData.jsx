import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { TOURNAMENT_STATUS } from '../../../../lib/enum';
import GameRoomTournamentDetails from './GameRoomTournamentDetails.jsx';
import { MESSAGES } from '../../../../lib/const.js';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

const messages = MESSAGES().GAME_ROOM_TOURNAMENT_DATA;
const tournamentTitle = [
  messages.CURRENT_TOURNAMENT_TITLE,
  messages.PAST_TOURNAMENT_TITLE
];

export default class GameRoomTournamentData extends React.Component {
  static propTypes = {
    visibleTournaments: PropTypes.arrayOf(PropTypes.any),
    history: PropTypes.objectOf(PropTypes.any),
    currentRating: PropTypes.number.isRequired
  };

  static defaultProps = {
    visibleTournaments: [],
    history: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      currentTournaments: [],
      pastTournaments: [],
      gameData: null
    };
  }

  componentWillMount() {
    const {
      gameId
    } = this.props;
    if (!!gameId) {
      this.getGame(gameId);
    }
  }

  componentDidMount() {
    this.classifyTournament(this.props.visibleTournaments);
    this.tournamentFilterWatcher = setInterval(() => {
      const { visibleTournaments } = this.props;
      this.classifyTournament(visibleTournaments);
    }, 60000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visibleTournaments !== nextProps.visibleTournaments) {
      const { visibleTournaments } = nextProps;
      this.classifyTournament(visibleTournaments);
    }
    if (nextProps.gameId !== this.props.gameId) {
      this.getGame(nextProps.gameId);
    }
  }

  componentWillUnmount() {
    clearInterval(this.tournamentFilterWatcher);
  }

  getGame = async (gameId) => {
    if (gameId) {
      Meteor.call('games.item', gameId, (error, result) => {
        if (!error) {
          this.setState({
            gameData: result
          });
        }
      });
    }
  }

  getTitle = (title, index) => {
    const { gameData } = this.state;
    return gameData ? (
      <div key={title + index} className="tournament--header">
        <span>{`${title} for ${gameData ? gameData.title : ''}`}</span>
      </div>
    ) :
      <div className="loading">
        <LoadingIcon
          width={'30px'}
          height={'20px'}
        />
      </div>
      ;
  }

  getTournamnents = (tournaments, title) => {
    const { history } = this.props;
    return (
      <div className="tournament--content" key={title}>
        {tournaments && tournaments.length > 0 ?
          tournaments.map(tournament => (
            <GameRoomTournamentDetails
              key={tournament._id}
              tournament={tournament}
              currentRating={this.props.currentRating}
              history={history}
              title={title}
            />
          ))
          : tournaments && tournaments.length === 0 ?
            <div className="tournament--content__warning">
              <span>{``}</span>
            </div>
            : null
        }
      </div>
    );
  }

  classifyTournament = (visibleTournaments) => {
    let currentTournaments = [];
    let pastTournaments = _.filter(visibleTournaments, (tournament) => {
      if (tournament.status === TOURNAMENT_STATUS.END) {
        return true;
      }
      currentTournaments.push(tournament);
      return false;
    });
    currentTournaments = _.orderBy(currentTournaments, ['startTime'], ['asc']);
    pastTournaments = _.orderBy(pastTournaments, ['startTime'], ['desc']);
    this.setState({
      currentTournaments,
      pastTournaments,
    });
  }


  render() {
    const { loading } = this.props;
    const {
      currentTournaments,
      pastTournaments
    } = this.state;
    const allTournaments = [currentTournaments, pastTournaments];
    currentTournaments.sort((a, b) => a.startTime - b.startTime);
    return (
      <div className="tg-container tournament--wrapper">
        {
          loading === false ?
            <div className="loading">
              <LoadingIcon
                width={'30px'}
                height={'20px'}
              />
            </div>
            :
            allTournaments.map((tournaments, index) => {
              return [
                this.getTitle(tournamentTitle[index], index),
                this.getTournamnents(tournaments, tournamentTitle[index])
              ];
            })
        }
      </div>
    );
  }
}
