/* eslint no-underscore-dangle: 0 */
/* globals Roles */
import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import ModalVideo from 'react-modal-video';
import screenfull from 'screenfull';
import isMobile from 'ismobilejs';
import PlayerInviteModal from '../containers/PlayerInviteModal.js';
import ItemEquipped from '../containers/ItemEquipped';
import GameRoomTeams from './GameRoomTeams.jsx';
import {
  BUTTON,
  GAME_CONFIG_OPTION,
  PLAY_WITH_FRIEND_STATEMENT,
  CHAT_SENDER, COINS_WAGER, LEVELS, BACKGROUND_ITEMS
} from '../../../../lib/enum';
import GameSelection from '../../core/containers/GameSelection.js';


class GameRoomNetwork extends React.Component {
  static propTypes = {
    gameData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    clearGameRoomNoNotiId: PropTypes.func.isRequired,
    invitePlayer: PropTypes.func.isRequired,
    handleSelectOption: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    createGameMatch: PropTypes.func.isRequired,
    updateStatus: PropTypes.func.isRequired,
    history: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    previousGame: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    kickUser: PropTypes.func.isRequired,
    leaveRoom: PropTypes.func.isRequired,
    switchTeam: PropTypes.func.isRequired,
    changePlayerType: PropTypes.func.isRequired,
    hostCancelInvite: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    userReady: PropTypes.func.isRequired,
    setPlayerTyping: PropTypes.func.isRequired,
    isGamePool: PropTypes.bool,
    handleChangeSlotOption: PropTypes.func.isRequired,
    updateAICodeForRobotSlot: PropTypes.func.isRequired
  };

  static defaultProps = {
    isGamePool: false,
    gameData: null,
    loading: null,
    history: null,
    game: null,
    users: [],
    previousGame: []
  };

  constructor(props) {
    super(props);
    const { history } = this.props;
    const { state } = history.location;

    this.state = {
      openModal: false,
      teamID: null,
      slot: null,
      gameData: null,
      notiId: state && state.notiId || '',
      timer: 0,
      readyButton: BUTTON.READY,
      noRobot: true,
      notReady: true,
      previousGameId: null,
      isMinimized: !!(window.innerWidth <= 768), // Chat box should be minimized when in mobile view
      userView: null,
      isOpenQuickOverviewVideo: false
    };

    this.handleButtonInvite = this.handleButtonInvite.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.kickUser = this.kickUser.bind(this);
  }

  componentDidMount() {
    window.onbeforeunload = (e) => {
      e.returnValue = 'Leave room?';
    };
  }

  componentWillReceiveProps(nextProps) {
    const { leaveRoom, gameData, users } = this.props;
    const newGameData = nextProps.gameData;
    const previousGame = nextProps.previousGame;
    const userId = Meteor.userId();
    const newUsers = nextProps.users;
    const object = {};
    if (!newGameData || !newGameData.playerInfo) return;
    const memberInfo = newGameData.playerInfo.find(element => element.userId === userId);

    if (previousGame.length > 0 && JSON.stringify(previousGame) !== JSON.stringify(this.props.previousGame)) {
      this.setState({ previousGameId: previousGame[0]._id });
    }

    if (memberInfo && memberInfo.playerType === GAME_CONFIG_OPTION.AI && memberInfo.aiList && memberInfo.aiList.length === 0) {
      this.setState({ noRobot: true });
    } else {
      this.setState({ noRobot: false });
    }

    // fix owner not ready issue
    for (let w = 0; w < newGameData.playerInfo.length; w++) {
      const p = newGameData.playerInfo[w];
      if (p.userId === newGameData.owner) {
        p.ready = true;
      }
    }

    if (!!newGameData.playerInfo.find(element => element.playerType === GAME_CONFIG_OPTION.DEFAULT || (element.userId && !element.ready))) { // eslint-disable-line
      this.setState({ notReady: true });
    } else {
      this.setState({ notReady: false });
    }

    if (!newGameData.playerInfo.find(player => player.ready === false || player.playerType === GAME_CONFIG_OPTION.DEFAULT) && this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.setState({ notiId: '' });
    }
    if (!newGameData.playerInfo.find(player => player.playerType === GAME_CONFIG_OPTION.DEFAULT)
      && newGameData.playerInfo.find(player => player.ready === false) && !this.interval) {
      this.interval = setInterval(this.timer, 1000);
    }
    if (this.chatBox) {
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
    if (gameData && !newGameData) {
      leaveRoom(gameData._id);
    }

    const nextPlayerInfo = get(nextProps, 'gameData.playerInfo', []);
    const prevPlayerInfo = get(this.props, 'gameData.playerInfo', []);
    if (!isEqual(prevPlayerInfo, nextPlayerInfo)) {
      const userView = nextPlayerInfo.find(p => p.userId === userId);
      this.setState({
        userView
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { gameData, history } = this.props;
    const prevGameData = prevProps.gameData;
    const userId = Meteor.userId();

    if (!userId) {
      history.push('/');
    }

    if (prevGameData && prevGameData.chatLogs && gameData.chatLogs
      && JSON.stringify(prevGameData.chatLogs) !== JSON.stringify(gameData.chatLogs) && this.chatBox) {
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    if (gameData && gameData.inRoom) {
      console.log(`game room network get inRoom so to go /playgame ${gameData.inRoom}`);
      history.push(`/playgame/${gameData.inRoom}`);
    }
  }

  componentWillUnmount() {
    const { clearGameRoomNoNotiId, gameData, leaveRoom } = this.props;
    const userId = Meteor.userId();

    window.removeEventListener('beforeunload', this.onUnload);
    clearInterval(this.interval);
    if (gameData && gameData.owner === userId) {
      // console.log("deleting old game room after 1 sec");
      setTimeout(() => {
        clearGameRoomNoNotiId(gameData._id);
      }, 1000);
    } else if (gameData && !gameData.inRoom) {
      leaveRoom(gameData._id);
    }
  }

  handleButtonInvite(item) {
    const { invitePlayer, gameData } = this.props;
    const { teamID, slot } = this.state;
    const inviteInfo = {
      userId: item._id,
      gameRoomId: gameData._id,
      teamID,
      slot,
      username: item.username
    };

    invitePlayer(inviteInfo, (notiId) => {
      if (notiId) {
        this.setState({ notiId, timer: 0 });
        this.notiId = notiId;
      }
    });
    this.setState({
      openModal: false
    });
  }

  timer = () => {
    const { timer } = this.state;

    this.setState({ timer: timer + 1 });
  };

  handleModal(value, teamID, slot) {
    const { gameData } = this.props;
    const { userView } = this.state;
    const userId = Meteor.userId();

    if (!value) {
      this.setState({
        openModal: value
      });
    } else if (userId === gameData.owner || get(userView, 'teamID') === teamID) {
      if (!value) {
        this.setState({
          openModal: value
        });
      } else {
        this.setState({
          openModal: value,
          teamID,
          slot
        });
      }
    }
  }

  handleResumeGame() {
    const { createGameMatch, gameData, history: { location: { state } } } = this.props;
    const { previousGameId } = this.state;
    // db.ActiveGameList.findOne({_id: "LbuHNacSZzyMaqfFW"})

    const notiId = this.notiId ? this.notiId : state.notiId;
    const gameOption = {
      gameRoomId: gameData._id,
      gameId: gameData.gameId,
      difficulty: gameData.level,
      playerInfo: gameData.playerInfo,
      owner: gameData.owner,
      resumeGameId: previousGameId,
      notiId
    };

    createGameMatch(gameOption);
  }

  handleStartGame(checkCoins) {
    const { createGameMatch, gameData, updateStatus } = this.props;
    const userId = Meteor.userId();
    console.log('gameData', gameData);

    if (gameData.owner === userId) {
      const checkValid = _.find(gameData.playerInfo, (member) => {
        return member.userId && member.ready === false;
      });

      if (checkCoins.outOfCoins) {
        const text = `${checkCoins.username} do not have enough coins`;

        toast(text, { type: 'error', autoClose: 5000 });

        return;
      }

      if (checkValid) {
        toast(PLAY_WITH_FRIEND_STATEMENT.CAN_NOT_START, { type: 'info', autoClose: 5000 });

        return;
      }

      const gameOption = {
        gameRoomId: gameData._id,
        gameId: gameData.gameId,
        difficulty: gameData.level,
        playerInfo: gameData.playerInfo,
        owner: gameData.owner
      };

      if (screenfull.enabled && (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch)) {
        screenfull.request();
      }
      createGameMatch(gameOption);
    } else {
      updateStatus(gameData._id);
    }
  }

  kickUser(team, index) {
    const { kickUser, gameData } = this.props;

    kickUser(gameData._id, team, index);
  }

  handleSelectPreviousGame = (previousGameId) => {
    this.setState({ previousGameId });
  };

  handleCancelInvite = (userId) => {
    const { hostCancelInvite, gameData } = this.props;
    const { notiId } = this.state;

    hostCancelInvite(gameData._id, notiId, userId);
    clearInterval(this.interval);
    this.interval = null;
  };

  handleReadyButton = () => {
    const { readyButton } = this.state;
    const { userReady, gameData } = this.props;

    let becomeReady = true;
    if (readyButton !== BUTTON.READY) {
      becomeReady = false;
    }
    userReady(gameData._id, becomeReady,  (res) => {
      if (res) {
        if (readyButton === BUTTON.READY) {
          this.setState({ readyButton: BUTTON.NOT_READY });
        } else if (readyButton === BUTTON.NOT_READY) {
          this.setState({ readyButton: BUTTON.READY });
        }
      }
    });
  };

  handleMinimizeChatBox = () => {
    const { isMinimized } = this.state;

    this.setState({ isMinimized: !isMinimized });
  };

  backToSelectMode() {
    const { history, gameData } = this.props;

    history.push('/gamesBoard', { gameId: gameData.gameId });
  }

  handleKeyPress = (event) => {
    const { setPlayerTyping, gameData } = this.props;

    if (event.target.value.length > 0) {
      setPlayerTyping(gameData._id, true);
    } else {
      setPlayerTyping(gameData._id, false);
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
      this.message.style.cssText = 'height: auto';
      this.messageBox.style.cssText = 'height: auto';
      setPlayerTyping(gameData._id, false);
    } else {
      const height = Math.min(20 * 5, this.message.scrollHeight);

      this.messageBox.style.cssText = `height: ${height}px`;
      this.message.style.cssText = `height: ${height}px`;
    }
  };

  sendMessage = () => {
    const { sendMessage, gameData } = this.props;

    sendMessage(gameData._id, this.message.value);
    this.message.value = '';
  };

  openModal = () => { this.setState({ isOpenQuickOverviewVideo: true }); }

  closeModal = () => { this.setState({ isOpenQuickOverviewVideo: false }); }

  render() {
    const {
      openModal, readyButton, isMinimized, noRobot, notReady, previousGameId, timer, userView,
      isOpenQuickOverviewVideo
    } = this.state;
    const {
      gameData, loading, users, previousGame, isGamePool, switchTeam, changePlayerType, handleSelectOption,
      handleChangeSlotOption, updateAICodeForRobotSlot, game
    } = this.props;
    const userId = Meteor.userId();
    if (loading) {
      return (
        <div className="container page--gamesroom">
          {/* <Banner title="Configure Game" /> */}
        </div>
      );
    }
    const invitedPlayers = _.filter(gameData.playerInfo, item => !!item.userId);

    const team1 = _.filter(gameData.playerInfo, item => Number(item.teamID) === 0);
    const team2 = _.filter(gameData.playerInfo, item => Number(item.teamID) === 1);
    const buttonName = userId === gameData.owner ? BUTTON.START_GAME : BUTTON.LEAVE_ROOM;
    const disabledClassname = (buttonName === BUTTON.START_GAME && (noRobot || notReady)) || (buttonName === BUTTON.LEAVE_ROOM);
    let checkCoins = {};
    const checkCoinsOfUser = (memberInfo) => {
      const foundUser = users.find(user => user._id === memberInfo.userId);

      if (foundUser) {
        checkCoins = Object.assign({}, {
          outOfCoins: true,
          username: foundUser.username
        });
      } else if (memberInfo.userId === userId) {
        checkCoins = Object.assign({}, {
          outOfCoins: true,
          username: Meteor.user().username
        });
      }
    };
    let coinsWager = 0;

    switch (gameData.level) {
      case LEVELS.BEGINNER:
        coinsWager = COINS_WAGER.BEGINNER;
        break;
      case LEVELS.ADVANCED:
        coinsWager = COINS_WAGER.ADVANCED;
        break;
      default:
        break;
    }

    if (this.state[0] < coinsWager) {
      team1.map(member => checkCoinsOfUser(member));
    } else if (this.state[1] < coinsWager) {
      team2.map(member => checkCoinsOfUser(member));
    }

    let playerIsTyping = null;

    if (gameData.playerIsTyping) {
      playerIsTyping = gameData.playerIsTyping.filter(uid => uid !== userId);
    }
    const teams = [team1, team2];
    const assignRoBot = userView.playerType === GAME_CONFIG_OPTION.AI;
    // for now we want users play online game.
    // play for free.
    // const mySelf = users.find(user => user._id === userView.userId);
    // const disableReadyBtn = (assignRoBot && noRobot) || Number(get(mySelf, 'profile.coins', 0)) < COINS_WAGER[gameData.level.toUpperCase()];
    const disableReadyBtn = (assignRoBot && noRobot);
    const gameInfo = [];
    gameInfo.push(game.title);
    if (!isGamePool && gameData && gameData.playerInfo && gameData.playerInfo.length) {
      const teamSize = gameData.playerInfo.length / 2;
      gameInfo.push(`${teamSize}v${teamSize}`);
    }
    gameInfo.push(gameData.level);

    return (
      <div className="tg-page tg-page--general tg-page--gamesroom">
        <div key="configgame" className={`gamesRoom__wrapper ${isMinimized && 'minimize-chatBox'}`}>
          <div className="gamesboard__header">
            <div className="gamesboard__header__filter">
              <span className="gamesboard__header__filter__title">Game Info</span>
              <div className="gamesboard__header__filter__gameSelection">
                <img src={game.imageUrl} alt={game.title} />
                <span>{gameInfo.join(' - ')}</span>
              </div>
            </div>
            {/* <div className="gamesboard__header__link">
              <ModalVideo channel="youtube" isOpen={isOpenQuickOverviewVideo} videoId="Afo1HG9-wsk" onClose={this.closeModal} />
              <a className="video-link" onClick={this.openModal}>
                <i className="fa fa-play-circle-o" />
                How to Play the Pool Game
              </a>
            </div> */}
          </div>
          <PlayerInviteModal
            closeModal={() => { this.setState({ openModal: false }); }}
            openModal={openModal}
            handleButtonInvite={this.handleButtonInvite}
            handleModal={this.handleModal}
            gameId={gameData.gameId}
            gameRoomId={gameData._id}
            level={gameData.level}
            invitedPlayers={invitedPlayers}
          />
          <ReactTooltip />
          <div key="configmode" className="gamesRoomEntry__wrapper gamesRoomEntry__wrapper--configmode">
            <div className="configure-groups__header">
              <div
                aria-hidden
                className="back-btn"
                onClick={() => this.backToSelectMode()}
              >
                <i className="fa fa-angle-left" />
                {' '}
                <span>Back</span>
              </div>
              <h1>Configure Playing Mode</h1>
            </div>
            <GameRoomTeams
              teams={teams}
              gameData={gameData}
              switchTeam={switchTeam}
              isGamePool={isGamePool}
              handleInvitationModel={this.handleModal}
              changePlayerType={changePlayerType}
              users={users}
              handleCancelInvite={this.handleCancelInvite}
              handleSelectOption={handleSelectOption}
              userView={userView}
              handleChangeSlotOption={handleChangeSlotOption}
              updateAICodeForRobotSlot={updateAICodeForRobotSlot}
            />
          </div>
          <div key="container" className="gamesRoomEntry__wrapper">

            {
              !!(Array.isArray(team1[0].userId && team1[0].defaultItems) && team1[0].defaultItems.length) && isGamePool
              && (
                <ItemEquipped
                  renderTypes={BACKGROUND_ITEMS[gameData.gameId]}
                  ownerRoom={gameData.owner}
                  gameRoomId={gameData._id}
                  userId={team1[0].userId}
                  defaultItems={team1[0].defaultItems}
                  className="maxWidth300"
                />
              )
            }
            <div className="startGame">
              {
                buttonName !== BUTTON.START_GAME
                && (
                  <button
                    type="button"
                    className={`btn button--startgame ${disableReadyBtn && 'disabled-button'}`}
                    onClick={() => this.handleReadyButton()}
                    disabled={disableReadyBtn}
                  >
                    {readyButton}
                  </button>
                )
              }
              <button
                type="button"
                className={`btn button--startgame ${buttonName === BUTTON.START_GAME ? '' : ' leave'} ${(disabledClassname) && 'disabled-button'}`}
                onClick={() => {
                  if (buttonName === BUTTON.START_GAME) {
                    this.handleStartGame(checkCoins);
                  } else {
                    this.backToSelectMode();
                  }
                }}
                disabled={buttonName === BUTTON.START_GAME && (noRobot || notReady)}
              >
                {buttonName}
              </button>
              {/* {
                previousGame.length > 0 &&
                  <div className='button--previousGame'>
                    <div className="form-group">
                      <select
                        required="required"
                        value={previousGameId}
                        onChange={(e) => {
                          this.handleSelectPreviousGame(e.target.value);
                        }}
                      >
                        {
                          previousGame.map(game => (
                            <option
                              value={game._id}
                              key={game._id}
                            >
                              {moment(game.createdAt).format('MMMM DD YYYY, HH:mm a')}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <button
                      className="button--startgame"
                      onClick={() => {
                        this.handleResumeGame();
                      }}
                    >Resume Prev Game
                    </button>
                  </div>
              } */}
            </div>
            {
              checkCoins.outOfCoins
              && (
              <div className="outOfCoin-warning">
                <span>{checkCoins.username}</span>
                {' '}
do not have enough coins
              </div>
              )
            }
            <div className="exit-warning">
              Warning: you will lose the game if you switch out, minimize or close the browser tab once the game starts!
            </div>
          </div>
        </div>
        <div key="chathistory" className={`page--gamesroom__log ${isMinimized && 'minimize-chatBox'}`}>
          <div className="chatHistoryBlock">
            <div className="chatHistoryHeader" onClick={() => this.handleMinimizeChatBox()}>
              <div className="chatHistoryTitle">
                Chat
              </div>
              <div aria-hidden="true" className="chatHistoryHeaderButton">
                {
                  isMinimized ? '+' : <i className="fa fa-times" />
                }
              </div>
            </div>
            <div
              className="chatHistoryScroll"
              id="chatHistoryScroll"
              ref={(e) => { this.chatBox = e; }}
            >
              <div className="chatHistory">
                <div className="chatHistory__List">
                  {
                    gameData.chatLogs && gameData.chatLogs.map((item, index) => {
                      let senderClassname = CHAT_SENDER.USER_TEXT;
                      let messageClassname = 'isUser';
                      let opponent = null;

                      if (item[0].sender !== userId && item[0].sender !== CHAT_SENDER.SYSTEM) {
                        senderClassname = CHAT_SENDER.REVEAL_ELEMENT;
                        messageClassname = '';
                        opponent = users.find(user => user._id === item[0].sender);
                      } else if (item[0].sender === CHAT_SENDER.SYSTEM) {
                        senderClassname = CHAT_SENDER.SYSTEM;
                        messageClassname = '';
                        opponent = users.find(user => user._id === item[0].owner);
                      }
                      return (
                        <div
                          className="chatHistory__List__Item"
                          key={item[0].sender + index} // eslint-disable-line react/no-array-index-key
                        >
                          <div
                            className={`chatHistory__List__Item__Line chatHistory__List__Item__Line--${senderClassname}`}
                          >
                            {
                              opponent
                              && (
                              <div className="chatHistory__List__Item__Line__User">
                                {
                                  item[0].sender !== CHAT_SENDER.SYSTEM
                                  && (
                                  <img
                                    src={opponent.avatar ? opponent.avatar.url : "/img_v2/ProfileIcon.png"}
                                    alt="user Chat"
                                  />
                                  )
                                }
                                <span>{opponent.username}</span>
                              </div>
                              )
                            }
                            <div
                              className={`chatHistory__List__Item__Line__Content${item[0].sender === CHAT_SENDER.SYSTEM ? `--${senderClassname}` : ''}`}
                            >
                              {
                                item.map((element, jindex) => (
                                  <div
                                    className={`bubble you ${messageClassname}`}
                                    dangerouslySetInnerHTML={{ __html: element.message }}
                                    key={element.message + jindex} // eslint-disable-line react/no-array-index-key
                                  />
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                  {
                    playerIsTyping && playerIsTyping.map((userId) => {
                      const opponent = users.find(user => user._id === userId);
                      const senderClassname = CHAT_SENDER.REVEAL_ELEMENT;

                      return (
                        <div
                          className="chatHistory__List__Item"
                          key={`${userId}-typing`} // eslint-disable-line react/no-array-index-key
                        >
                          <div
                            className={`chatHistory__List__Item__Line chatHistory__List__Item__Line--${senderClassname}`}
                          >
                            {
                              opponent
                              && (
                              <div className="chatHistory__List__Item__Line__User">
                                <img
                                  src={opponent.avatar ? opponent.avatar.url : "/img_v2/ProfileIcon.png"}
                                  alt="user Chat"
                                />
                                <span>{opponent.username}</span>
                              </div>
                              )
                            }
                            <div
                              className="chatHistory__List__Item__Line__Content"
                              data-tiptext={`${opponent.username} is typing`}
                            >
                              <div className="bubble you">
                                <div className="chatHistory__List__Item__Line__Content--isTyping">
                                  <span className="chatHistory__List__Item__Line__Content--isTyping__dot" />
                                  <span className="chatHistory__List__Item__Line__Content--isTyping__dot" />
                                  <span className="chatHistory__List__Item__Line__Content--isTyping__dot" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
            <div
              id="chatHistoryAction"
              className="chatHistoryAction"
              ref={(e) => { this.messageBox = e; }}
            >
              <textarea
                className="chatHistoryAction--textarea"
                placeholder="Message..."
                ref={(mess) => { this.message = mess; }}
                onKeyDown={this.handleKeyPress}
                rows={1}
              />
              <i className="tg-icon-paper-plane" onClick={() => this.sendMessage()} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GameRoomNetwork;
