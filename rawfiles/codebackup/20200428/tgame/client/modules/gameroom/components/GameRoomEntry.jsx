/* global Roles */
import React from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _forEach from 'lodash/forEach';
import ModalVideo from 'react-modal-video';
import swal from 'sweetalert';
import screenfull from 'screenfull';
import isMobile from 'ismobilejs';
import { orientation } from 'o9n';
import LocalGameRoomTeams from './GameRoomTeams.Local.jsx';
import { ROLES, GAME_CONFIG_OPTION, BACKGROUND_ITEMS } from '../../../../lib/enum';
import ItemEquipped from '../containers/ItemEquipped';

const gameAllowPlayMySelf = ['lucky_pool'];
class GameRoomEntry extends React.Component {
  static propTypes = {
    gameRoomData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    clearGameRoomNoNotiId: PropTypes.func.isRequired,
    createGame: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    isGamePool: PropTypes.bool
  };

  static defaultProps = {
    gameRoomData: null,
    history: null,
    loading: false,
    isGamePool: false
  };

  constructor(props) {
    super(props);
    this.state = {
      playerControllers: [],
      isOpen: false
    };

    this.isLandscape = orientation.type.includes('landscape');
    this.handleSelectOptionType = this.handleSelectOptionType.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { gameRoomData } = this.props;
    if (gameRoomData === null && gameRoomData !== nextProps.gameRoomData) {
      const playerInfo = _get(nextProps, 'gameRoomData.playerInfo', []);
      const playerControllers = Array(playerInfo.length).fill({});
      _forEach(playerInfo, (pi) => {
        playerControllers[pi.slot] = {
          type: GAME_CONFIG_OPTION.HUMAN,
          version: '',
          label: '',
          selectTBot: false
        };
      });
      this.setState({
        playerControllers
      });
    }
  }

  componentDidUpdate() {
    const { gameRoomData, history } = this.props;

    if (gameRoomData && gameRoomData.inRoom) {
      history.push(`/playgame/${gameRoomData.inRoom}`);
    }
  }

  componentWillUnmount() {
    const { clearGameRoomNoNotiId, gameRoomData } = this.props;

    if (gameRoomData && !gameRoomData.inRoom) {
      clearGameRoomNoNotiId(gameRoomData._id);
    }
  }

  handleSelectOptionType(slot, type, selectTBot) {
    const { gamesRelease } = this.props;
    const { playerControllers } = this.state;
    let releaseName = '';
    let releaseLabel = '';

    if (type === GAME_CONFIG_OPTION.AI) {
      if (gamesRelease && gamesRelease.length > 0) {
        // debugger;
        releaseName = gamesRelease[0]._id;
        releaseLabel = gamesRelease[0].releaseName;
      }
    }

    if (playerControllers[slot].type !== type) {
      // update player version each changes player type
      this.handleSelectReleaseVersion(slot, releaseName, releaseLabel);
    }

    this.setState((prevState) => {
      const newPlayerControllers = prevState.playerControllers;
      newPlayerControllers[slot] = {
        type,
        selectTBot,
        version: selectTBot ? '' : newPlayerControllers[slot].version,
        label: selectTBot ? '' : newPlayerControllers[slot].label
      };
      return {
        playerControllers: [...newPlayerControllers]
      };
    });
  }

  goFullScreen() {
    const el = document.documentElement;
    // const el = document.getElementById("gameDiv");
    const rfs = el.requestFullscreen
      || el.webkitRequestFullScreen
      || el.mozRequestFullScreen
      || el.msRequestFullscreen;
    const mainDiv = document.getElementById('mainDiv');
    mainDiv.style.position = 'absolute';
    // mainDiv.style.top = "0px";


    rfs.call(el);
  }

  handleStartGame = () => {
    const {
      createGame, gameRoomData, history, defaultItems, game
    } = this.props;
    const { playerControllers } = this.state;
    const playerTypes = [];
    const aiVersion = [];
    const aiLabel = [];
    let humanTypeCount = 0;
    let noneTypeCountT1 = 0; // eslint-disable-line
    let noneTypeCountT2 = 0; // eslint-disable-line
    _forEach(playerControllers, (player, index) => {
      if (player.type !== "None") {
        if (player.type === "Human") {
          humanTypeCount++;
        }
        playerTypes.push(player.type);
        aiVersion.push(player.version);
        aiLabel.push(player.label);
      } else if (index % 2 === 0) { // eslint-disable-line
        noneTypeCountT1++;
      } else {
        noneTypeCountT2++;
      }
    });

    let errorMess = null;

    if (humanTypeCount > 1 && !gameAllowPlayMySelf.includes(game.name)) {
      errorMess = "You can not control both players at the same time.";
    }

    if (noneTypeCountT1 !== noneTypeCountT2) {
      errorMess = "Team size is not the same.";
    }

    if (errorMess) {
      swal("Error", errorMess, "error");
      return false;
    }

    // go full screen
    // this.goFullScreen();

    const isAIUser = Roles.userIsInRole(Meteor.userId(), ROLES.AI);
    // debugger;
    const gameOption = {
      gameId: gameRoomData.gameId,
      difficulty: gameRoomData.level,
      isAIUser,
      // aiVersion: gameRoomData.playerInfo.map(player => player.aiVersion)
      // need to have user select a version of code from drop down;
      // can be different for each player when both are "my robot"
      playerTypes,
      aiVersion,
      aiLabel,
      gameRoomId: gameRoomData._id
    };
    this.isLandscape = orientation.type.includes('landscape');

    if ((isMobile.apple.phone || isMobile.apple.tablet) && !this.isLandscape) {
      swal({
        title: 'You should rotate screen to landscape to enjoy the game!',
        text: "",
        icon: "warning"
      });
    } else {
      if (screenfull.enabled && (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch)) {
        screenfull.request();
      }

      return createGame(gameOption, defaultItems, history);
    }
    return null;
  };

  handleSelectReleaseVersion = (slot, version, label) => {
    this.setState((prevState) => {
      const newPlayerControllers = prevState.playerControllers;
      newPlayerControllers[slot] = {
        ...newPlayerControllers[slot],
        version,
        label
      };
      return {
        playerControllers: [...newPlayerControllers]
      };
    });
  }

  backToSelectMode = () => {
    const { history, gameRoomData } = this.props;

    history.push('/gamesBoard', { gameId: gameRoomData.gameId });
  }

  openModal = () => { this.setState({ isOpen: true }); }

  closeModal = () => { this.setState({ isOpen: false }); }

  render() {
    const {
      defaultItems, gameRoomData, loading, isGamePool, switchTeam, gamesRelease,
      game
    } = this.props;
    const { playerControllers, isOpen } = this.state;
    const playerInfo = _get(gameRoomData, 'playerInfo[0]');

    if (loading) {
      return (
        <div className="container page--gamesroom">
          {/* <Banner title="Configure Game" /> */}
        </div>
      );
    }

    const team1 = _.filter(gameRoomData.playerInfo, item => Number(item.teamID) === 0);
    const team2 = _.filter(gameRoomData.playerInfo, item => Number(item.teamID) === 1);
    const teams = [team1, team2];
    const gameInfo = [];
    gameInfo.push(game.title);
    if (!isGamePool && gameRoomData && gameRoomData.playerInfo && gameRoomData.playerInfo.length) {
      const teamSize = gameRoomData.playerInfo.length / 2;
      gameInfo.push(`${teamSize}v${teamSize}`);
    }
    gameInfo.push(gameRoomData.level);

    return (
      <div className="tg-page tg-page--general tg-page--gamesRoomEntry">
        <div className="gamesRoomEntry__wrapper">
          <div className="gamesboard__header">
            <div className="gamesboard__header__filter">
              <span className="gamesboard__header__filter__title">Game Info</span>
              <div className="gamesboard__header__filter__gameSelection">
                <img src={game.imageUrl} alt={game.title} />
                <span>{gameInfo.join(' - ')}</span>
              </div>
            </div>
            {/* <div className="gamesboard__header__link">
              <ModalVideo channel="youtube" isOpen={isOpen} videoId="Afo1HG9-wsk" onClose={this.closeModal} />
              <a className="video-link" onClick={this.openModal}>
                <i className="fa fa-play-circle-o" />
                How to Play the Pool Game
              </a>
            </div> */}
          </div>
          <div className="configure-groups">
            <div className="configure-groups__header">
              <div
                aria-hidden
                className="back-btn"
                onClick={this.backToSelectMode}
              >
                <i className="fa fa-angle-left" />
                {' '}
                <span>Back</span>
              </div>
              <h1>Configure Playing Mode</h1>
            </div>
            <LocalGameRoomTeams
              teams={teams}
              gameRoomData={gameRoomData}
              switchTeam={switchTeam}
              isGamePool={isGamePool}
              handleSelectOptionType={this.handleSelectOptionType}
              handleSelectReleaseVersion={this.handleSelectReleaseVersion}
              playerControllers={playerControllers}
              gamesRelease={gamesRelease}
              defaultItems={defaultItems}
            />
          </div>
          <div className="tableCurrent">
            {
              !!(Array.isArray(defaultItems) && defaultItems.length)
              && (
                <ItemEquipped
                  renderTypes={_get(BACKGROUND_ITEMS, gameRoomData.gameId)}
                  gameRoomId={gameRoomData._id}
                  userId={playerInfo.userId}
                  defaultItems={defaultItems}
                  className="maxWidth300"
                />
              )
            }
            <div className="startGame">
              <button
                className="btn button--startgame"
                onClick={this.handleStartGame}
                type="button"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GameRoomEntry;
