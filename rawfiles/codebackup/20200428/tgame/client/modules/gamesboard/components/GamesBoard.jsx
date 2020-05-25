/* globals Roles */
/* eslint no-underscore-dangle: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import ModalVideo from 'react-modal-video';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import {
  ROLES, GAME_CONFIG_OPTION, OPPONENTS, SLOT_OPTION, MIGRATION_CONST
} from '../../../../lib/enum';
import GameContents from '../containers/GameContents.js';
import { getThumbImage, setTeamSlotsAndReorder } from '../../../../lib/util';
import GameSelection from '../../core/containers/GameSelection';
import _map from 'lodash/map';
// import LevelComponent from './LevelComponent.jsx';
// import OpponentComponent from './OpponentComponent.jsx';

class GamesBoard extends React.Component {
  static propTypes = {
    history: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    createGameRoom: PropTypes.func.isRequired,
    setLinkForGameRoom: PropTypes.func.isRequired
  };

  static defaultProps = {
    history: null
  };

  constructor(props) {
    super(props);
    const { initState } = props;

    this.state = {
      levelSelected: _.get(initState, 'levelSelected', 'Beginner'),
      gameSelected: _.get(initState, 'gameSelected', null),
      gameRelease: _.get(initState, 'gameRelease', null),
      error: false,
      isOpen: false,
      gameMode: _.get(initState, 'gameMode', OPPONENTS.MYSELF.name),
      link: _.get(initState, 'gameRoomLink', '/gamesRoomEntry')
    };
  }

  componentWillMount() {
    const { history } = this.props;
    const user = Meteor.user();

    if (!Meteor.userId()) {
      history.push('/');
      return;
    }

    if (user && (user.accountStatus
      && !user.accountStatus.isActive || !user.roles)) {
        // we should always allow the user to play games
      // history.push('/');
    }
  }

  componentDidMount() {
    const { history } = this.props;
    const gameId = _.get(history, 'location.state.gameId');

    if (gameId) {
      const game = this.getGame(gameId);
      this.selectGame(game);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  componentDidUpdate() {
    const { history } = this.props;

    if (!Meteor.userId()) {
      history.push('/');
    }
  }

  getGame(_id) {
    const { gamesList } = this.props;
    return _.find(gamesList, { _id });
  }

  setError = (value) => {
    const isAI = Roles.userIsInRole(Meteor.userId(), ROLES.AI);

    if (isAI) {
      this.setState({
        error: value
      });
    }
  };

  selectMultiplayer = (teamSize) => {
    const { selectGame } = this.props;

    this.setState((prevState) => {
      const newGameSelected = prevState.gameSelected;
      newGameSelected.teamSize = teamSize;
      selectGame(newGameSelected);
      return {
        gameSelected: newGameSelected,
        error: false
      };
    });
  }

  selectLevel = (level) => {
    const { selectLevel } = this.props;
    selectLevel(level);
    this.setState({ levelSelected: level });
  };

  selectGameRelease = (version) => {
    const { updateRobotCodeId } = this.props;
    const { gameSelected } = this.state;

    updateRobotCodeId(version, gameSelected._id);
    this.setState({
      gameRelease: version
    });
  };

  gotoLink = (link) => {
    this.props.history.push(link);
  };
  resetLesson = (lessonId) => {
    Meteor.call("resetChat", lessonId, (error) => {
      if (error) {
        console.error(error);
      }
    });
  };

  selectGame = (game) => {
    const { selectGame, initState } = this.props;
    // set LocalState GAME_SELECTED
    selectGame(game);
    const defaultState = {
      levelSelected: _.get(initState, 'levelSelected', 'Beginner'),
      gameRelease: _.get(initState, 'gameRelease', null),
      error: false,
      isOpen: false,
      gameMode: _.get(initState, 'gameMode', OPPONENTS.MYSELF.name),
      link: _.get(initState, 'gameRoomLink', '/gamesRoomEntry')
    };

    this.setState({
      gameSelected: game,
      ...defaultState
    });
  };

  goToGameRoom = () => {
    const { createGameRoom, history } = this.props;
    const {
      gameSelected, gameMode, link, levelSelected: level
    } = this.state;
    const isAI = Roles.userIsInRole(Meteor.userId(), ROLES.AI);

    this.setState({
      error: false
    });

    const renderTeamMember = (teamSize, teamID) => _.map(_.range(0, teamSize), (v, k) => ({
      teamID,
      playerType: GAME_CONFIG_OPTION.DEFAULT,
      ready: false,
      slotOption: k === 0 && teamID == 0 ? null : SLOT_OPTION.NETWORK_PLAYER // eslint-disable-line
    }));
    let playerInfo = [];
    _.map(_.range(0, gameSelected.teamNumber), (teamID) => {
      playerInfo = _.union(playerInfo, renderTeamMember(gameSelected.teamSize, teamID));
    });
    // playerInfo = _.map(playerInfo, (player, slot) => ({ ...player, slot }));
    playerInfo = setTeamSlotsAndReorder(playerInfo, gameSelected.teamNumber);

    // we don't know anything about player yet except for count!
    let player = null;

    if (isAI) {
      player = {
        teamID: playerInfo[0].teamID,
        playerType: GAME_CONFIG_OPTION.AI,
        userId: Meteor.userId(),
        playerID: Meteor.userId(),
        ready: true,
        slot: 0,
        username: Meteor.user().username
        // user must select aiVersion later
        // aiVersion: gameRelease
      };
    } else {
      player = {
        teamID: playerInfo[0].teamID,
        playerType: GAME_CONFIG_OPTION.HUMAN,
        userId: Meteor.userId(),
        playerID: Meteor.userId(),
        ready: true,
        slot: 0,
        username: Meteor.user().username
      };
    }

    playerInfo[0] = player;

    const gameData = {
      owner: Meteor.userId(),
      gameId: gameSelected._id,
      level,
      mode: gameMode,
      playerInfo
    };

    if (link === '/tournament') {
      history.push(`${link}/${gameSelected._id}`, { title: gameSelected.title });
    } else {
      createGameRoom(gameData, (roomId) => {
        if (roomId) {
          history.push(link);
        }
      });
    }
  }

  selectOpponent = (link) => {
    const { setLinkForGameRoom, selectGame } = this.props;
    const { gameSelected } = this.state;

    if (link === OPPONENTS.PLAYERNETWORK.link) {
      if (gameSelected._id === MIGRATION_CONST.tankGameId) {
        this.setState((prevState) => {
          const newGameSelected = prevState.gameSelected;
          newGameSelected.teamSize = 1;
          selectGame(newGameSelected);
          return {
            gameSelected: newGameSelected,
            error: false
          };
        });
      }
      this.setState({ gameMode: OPPONENTS.PLAYERNETWORK.name });
      setLinkForGameRoom(link, OPPONENTS.PLAYERNETWORK.name);
    } else if (link === OPPONENTS.MYSELF.link) {
      this.setState({ gameMode: OPPONENTS.MYSELF.name });
      setLinkForGameRoom(link, OPPONENTS.MYSELF.name);
    }
    this.setState({
      link
    });
  };

  openModal = () => { this.setState({ isOpen: true }); }

  closeModal = () => { this.setState({ isOpen: false }); }

  renderGamesList = () => {
    const { gamesList } = this.props;

    const codingGames = [];
    
    codingGames.push({ 
      title: "Drawing Turtle Jr",
      imageUrl: '/images/turtlecolor1.png',
      lessonId: 'LNCG1'
    });
    codingGames.push({ 
      title: "Flappy Bird",
      imageUrl: '/images/flappybirdlogo.png',
      lessonId: 'LNCG3'
    });
    codingGames.push({ 
      title: "Drawing Turtle Sr",
      imageUrl: '/images/turtlegreen.png',
      lessonId: 'LNCG2'
    });
    codingGames.push({ 
      title: "3D Maze Escape",
      imageUrl: '/images/maze monkey.png',
      lessonId: 'LNCG4'
    });
    codingGames.push({ 
      title: "Candy Crush",
      imageUrl: '/images/candycrushscratchlogo.png',
      lessonId: 'LNCG0'
    });
    return (
      <div className="player-games">

        <div className="player-games__title" style={{backgroundColor: "#113e0e"}} >Coding Games</div>
        <div className="player-games__sliderGame" style={{backgroundColor: '#2b9f49'}}>
          {
            codingGames.map(game => (
              <div className="upgrade-games upgrade-games--groups" key={game._id}>
                <div className="upgrade-games__items">
                  <div className="upgrade-games__items__header gameBoard-page">
                    <div className="upgrade-games__items__header__logo">
                      <img src={game.imageUrl} alt={game.title} />
                    </div>
                    <div className="upgrade-games__items__header__player">
                      <span>&nbsp;{game.title}</span>
                      {/* <Link to={"/lessons/"+game.lessonId} className="link link--login">Play</Link> */}

                      <table>
                        <tbody>
                          <tr>
                            <td style={{width: "50%"}}>
                            <button  className="btn" onClick={() => this.gotoLink("/lesson/"+game.lessonId)} type="button">Play</button>

                            </td>
                            <td style={{width: "50%"}}>
                              <button  className="btnreset" onClick={() => this.resetLesson(game.lessonId)} type="button">Reset</button>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <br/>
        <br/>
        <br/>
        <br/>

        <div className="player-games__title">AI Games</div>
        <div className="player-games__sliderGame">
          {
            gamesList.map(game => (
              <div className="upgrade-games upgrade-games--groups" key={game._id}>
                <div className="upgrade-games__items">
                  <div className="upgrade-games__items__header gameBoard-page">
                    <div className="upgrade-games__items__header__logo">
                      <img src={game.imageUrl} alt={game.title} />
                    </div>
                    <div className="upgrade-games__items__header__player">
                    <span>&nbsp;{game.title}</span>
                      <button className="btn" onClick={() => this.selectGame(game)} type="button">Play</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  render() {
    const { history: propsHistory, gamesList } = this.props;
    const {
      levelSelected, gameSelected, error, gameMode,
      isOpen
    } = this.state;
    const isEnableCreateGameRoomButton = levelSelected && gameMode && _.get(gameSelected, 'teamSize');

    return (
      <div className="tg-page tg-page--general tg-page--gamesboard" id="games-board">
        <div className="gamesboard__wrapper">
          {
            !gameSelected && this.renderGamesList()
          }
          {
            gameSelected && (
              <div className="gamesboard__config">
                  {/*// ai version will be handled later at configure player type!*/}
                  {/*// error === 'NOT_RELEASE'*/}
                  {/*//   ?*/}
                  {/*//   renderError*/}
                  {/*//   :*/}
                <GameContents
                  levelSelected={levelSelected}
                  gameSelected={gameSelected}
                  selectLevel={this.selectLevel}
                  selectMultiplayer={this.selectMultiplayer}
                  setError={this.setError}
                  selectGameRelease={this.selectGameRelease}
                  selectOpponent={this.selectOpponent}
                  error={error}
                  history={propsHistory}
                  gameMode={gameMode}
                  selectGame={this.selectGame}
                />
                <button
                  type="button"
                  className="btn btn-create-gameroom"
                  disabled={!isEnableCreateGameRoomButton}
                  onClick={this.goToGameRoom}
                >
                  <i className="fa fa-play" />
                  Setup Game
                </button>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default GamesBoard;
