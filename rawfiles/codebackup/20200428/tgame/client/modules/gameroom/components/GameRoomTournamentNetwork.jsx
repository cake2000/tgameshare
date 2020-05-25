/* eslint no-underscore-dangle: 0 */
/* globals Roles */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  BUTTON,
  GAME_CONFIG_OPTION,
  TOURNAMENT_ROUND_STATUS,
  GAME_TYPE,
  PLAYER_TYPE,
  ROLES,
  CHAT_SENDER,
  MAIN_ITEMS,
  BACKGROUND_ITEMS
} from '../../../../lib/enum';
import { MESSAGES } from '../../../../lib/const';
import WinnerModal from './WinnerModal.jsx';
import ItemEquipped from '../containers/ItemEquipped';

export default class GameRoomTournamentNetWork extends React.Component {
  static propTypes = {
    gameData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    countdown: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    loading: PropTypes.bool,
    createTournamentGameMatch: PropTypes.func.isRequired,
    history: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    game: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tournamentLeaveRoom: PropTypes.func.isRequired,
    tournamentClearRoom: PropTypes.func.isRequired,
    updatePairStatus: PropTypes.func.isRequired,
    deleteNotification: PropTypes.func.isRequired,
    userReady: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    setPlayerTyping: PropTypes.func.isRequired,
    round: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    checkUserStatus: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    gameData: null,
    loading: null,
    history: null,
    aiVersion: [],
    checkUserStatus: null,
    round: null,
    game: null,
    countdown: null,
    users: []
  };

  constructor(props) {
    super(props);

    this.state = {
      index: null,
      team: null,
      isModalOpen: false,
      modalMessage: '',
      readyButton: BUTTON.READY,
      noRobot: true,
      notReady: true,
      isMinimized: false
    };
  }

  componentDidMount() {
    const { gameData, tournamentLeaveRoom } = this.props;

    window.onbeforeunload = () => {
      if (gameData) {
        tournamentLeaveRoom(gameData._id);
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    const { gameData, users } = this.props;
    const newGameData = nextProps.gameData;
    const newUsers = nextProps.users;
    const object = {};
    const memberInfo = newGameData.playerInfo.find(element => element.userId === Meteor.userId());

    if (memberInfo && memberInfo.playerType === GAME_CONFIG_OPTION.AI && memberInfo.aiList && memberInfo.aiList.length === 0) {
      this.setState({ noRobot: true });
    } else {
      this.setState({ noRobot: false });
    }

    if (newGameData.playerInfo.find(element => !element.ready)) {
      this.setState({ notReady: true });
    } else {
      this.setState({ notReady: false });
    }

    if (JSON.stringify(gameData) !== JSON.stringify(newGameData) || JSON.stringify(users) !== JSON.stringify(newUsers)) {
      newGameData.playerInfo.map((player) => {
        if (player.userId === Meteor.userId()) {
          object[player.teamID] = Meteor.user().profile.coins;

          this.setState(object);
        } else {
          const opponent = newUsers.find(user => user._id === player.userId);

          if (opponent) {
            object[player.teamID] = opponent.profile.coins;

            this.setState(object);
          }
        }

        return null;
      });
    }

    if (newGameData.playerInfo.find(player => player.inRoom === false) && gameData.playerInfo.find(player => player.inRoom)) {
      const player = gameData.playerInfo.find(element => element.inRoom);

      this.setState({ [player.teamID]: null });
    }
    if (this.chatBox) {
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
  }

  componentDidUpdate(prevProps) {
    const {
      gameData,
      history,
      checkUserStatus,
      countdown,
      pairData,
      updatePoint,
      round
    } = this.props;
    const oldCountdown = prevProps.countdown;
    const oldCheckUserStatus = prevProps.checkUserStatus;
    const prevGameData = prevProps.gameData;

    if (prevGameData && prevGameData.chatLogs && gameData.chatLogs
      && JSON.stringify(prevGameData.chatLogs) !== JSON.stringify(gameData.chatLogs) && this.chatBox) {
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    if (!checkUserStatus) {
      this.handleStartGame();
      if (gameData && gameData.inRoom) {
        history.push(`/playgame/${gameData.inRoom}`, { pairData });
      }
    } else if ((countdown && oldCountdown
        && countdown.count !== oldCountdown.count
        && countdown.count === 0)
      || (!checkUserStatus.userId && checkUserStatus !== oldCheckUserStatus)
      || (checkUserStatus.cancelTournamentGame
          && checkUserStatus.cancelTournamentGame === true
          && (!oldCheckUserStatus
          || checkUserStatus.cancelTournamentGame !== oldCheckUserStatus.cancelTournamentGame))) {
      if (!checkUserStatus.userId) {
        updatePoint(round._id, Meteor.userId(), history, PLAYER_TYPE.WINNER);
      } else {
        updatePoint(round._id, checkUserStatus.userId, history, PLAYER_TYPE.LOSER);
      }
      if (countdown && countdown.count === 0) {
        this.handleModal(true, MESSAGES().GAME_ROOM_TOURNAMENT_DATA.TIME_UP);
      } else if (!checkUserStatus.userId) {
        this.handleModal(true, MESSAGES().GAME_ROOM_TOURNAMENT_DATA.LUCKY);
      } else if (checkUserStatus.cancelTournamentGame === true) {
        this.handleModal(true, MESSAGES().GAME_ROOM_TOURNAMENT_DATA.OPPONENT_CANCEL);
      }
    }
  }

  componentWillUnmount() {
    const { gameData, tournamentLeaveRoom, tournamentClearRoom } = this.props;
    if (gameData && gameData.owner === Meteor.userId()) {
      tournamentClearRoom(gameData._id);
    } else if (gameData) {
      tournamentLeaveRoom(gameData._id);
    }
  }

  backFunction = () => {
    const { history } = this.props;

    history.push('/gamesBoard');
  };

  handleStartGame() {
    const {
      createTournamentGameMatch,
      gameData,
      checkUserStatus,
      updatePairStatus,
      countdown,
      history,
      pairData,
      round
    } = this.props;

    if (!checkUserStatus) {
      const gameOption = {
        gameRoomId: gameData._id,
        gameId: gameData.gameId,
        difficulty: gameData.level,
        playerInfo: gameData.playerInfo,
        gameType: GAME_TYPE.TOURNAMENT,
        owner: gameData.owner
      };

      if (gameData.aiVersion) {
        gameOption.aiVersion = gameData.aiVersion;
      }
      if (countdown && countdown.countdownStartGame === 0) {
        updatePairStatus(TOURNAMENT_ROUND_STATUS.IN_PROGRESS);
        const { notiId } = history.location.state;

        createTournamentGameMatch(gameOption, notiId, round._id, pairData.id);
      }
    }
  }

  handleChangeValue = (e) => {
    const { gameData, changePlayerType } = this.props;
    const value = e.target.value;
    changePlayerType(gameData._id, value);
  };

  handleModal = (state, message) => {
    const {
      round, game, history, deleteNotification
    } = this.props;

    this.setState({
      isModalOpen: state,
      modalMessage: message
    });
    deleteNotification(history.location.state.notiId);
    if (state === false) {
      const isOpenModal = round.numberOfPairs === round.numberOfFinishPairs;
      const params = {
        modalIsOpen: !isOpenModal,
        title: game.title,
        sectionKey: round.sectionId,
        tournamentId: round.tournamentId
      };
      console.log("dddd redirect to tournament/gameID in handleModal ");
      history.push(`/tournament/${game._id}`, params);
    }
  };

  handleReadyButton = () => {
    const { readyButton } = this.state;
    const { userReady, gameData } = this.props;

    userReady(gameData._id, (res) => {
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


  renderManualTeamMember(memberInfo) {
    const { gameData, users } = this.props;
    const user = Meteor.users.findOne({ _id: memberInfo.userId });
    const isHost = Meteor.userId() === gameData.owner;
    const isCurrentUser = memberInfo.userId === Meteor.userId();
    const name = user ? user.username : 'User not found';
    const disableAI = !memberInfo.aiList || memberInfo.aiList.length <= 0;
    const hostIsAI = disableAI && memberInfo.userId === Meteor.userId() && isHost;
    const disableProps = disableAI ? {
      disabled: true,
      'data-tip': 'You have no robot release, please go to My Robot first if you want play with Robot'
    } : {};
    const selectGameOption = () => {
      const isAiPlayer = Roles.userIsInRole(memberInfo.userId, ROLES.AI);
      if (isAiPlayer && memberInfo.userId === Meteor.userId()) {
        return (
          <div className={`form-group ${!isHost && 'group-guest'}`}>
            <div className="radio-group">
              <input
                onChange={e => this.handleChangeValue(e)}
                value={GAME_CONFIG_OPTION.HUMAN}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN}
                name="optionGame"
                type="radio"
                id="humanOption"
                disabled={memberInfo.ready && !isHost}
              />
              {' '}
              <label htmlFor="humanOption">Manual</label>
&nbsp;
              <input
                onChange={e => this.handleChangeValue(e)}
                value={GAME_CONFIG_OPTION.AI}
                {...disableProps}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.AI}
                name="optionGame"
                type="radio"
                id="robotOption"
                disabled={memberInfo.ready && !isHost}
              />
              {' '}
              <label {...disableProps} htmlFor="robotOption">Robot</label>
            </div>
          </div>
        );
      } return null;
    };
    let opponent = null;

    if (memberInfo.userId !== Meteor.userId()) {
      opponent = users.find(element => element._id === memberInfo.userId);
    }
    return (
      <div
        className="player--option select--option"
        key={memberInfo.userId}
      >
        <span className={`player--info__${memberInfo.userId === gameData.owner ? 'hosted' : 'guest'}`}>
          <div className="player--info__avatarName">
            {
              memberInfo.userId === Meteor.userId()
                ? (
                  <img
                    src={Meteor.user().avatar ? Meteor.user().avatar.url : "/img_v2/ProfileIcon.png"}
                    alt="user Chat"
                  />
                )
                : (
                  <img
                    src={opponent && opponent.avatar ? opponent.avatar.url : "/img_v2/ProfileIcon.png"}
                    alt="user Chat"
                  />
                )
            }
            <span>
              {name}
              {' '}
              {memberInfo.userId === gameData.owner && '(Host)'}
            </span>
          </div>
          <div className="player--info__wrapper">
            {
              this.state[memberInfo.teamID] !== null && this.state[memberInfo.teamID] !== undefined
              && (
              <div className="player--selection__coin">
                <img src="/images/coin.png" alt="" />
                <span>{this.state[memberInfo.teamID]}</span>
              </div>
              )
            }
          </div>
        </span>
        <div className={`player--info ${!selectGameOption() && 'no-option'} ${hostIsAI && isHost && 'host'}`}>
          { selectGameOption() }
          {
            ((memberInfo.inRoom || memberInfo.ready) && (!isCurrentUser || Roles.userIsInRole(memberInfo.userId, GAME_CONFIG_OPTION.HUMAN)))
            && (
            <span className="player--info__name">
                Playing manually
            </span>
            )
          }
        </div>
        <div className="player--timeout">
          <div className="player--info__container">
            {
              memberInfo.ready && memberInfo.userId !== gameData.owner
              && <span className="player--info__ready">READY</span>
            }
          </div>
        </div>
      </div>
    );
  }

  renderAITeamMember(memberInfo) {
    const { gameData, users } = this.props;
    const currentUserId = Meteor.userId();
    const isCurrentUser = memberInfo.userId === currentUserId;
    const isHost = currentUserId === gameData.owner;
    const aiList = memberInfo.aiList;
    const hostIsAI = memberInfo.userId === Meteor.userId() && isHost;
    const aiVersion = _.find(memberInfo.aiList, ai => ai._id === memberInfo.aiVersion);
    const selectAIVersion = () => {
      if (aiList && aiList.length > 0) {
        return (
          <div className="form-group">
            <select
              required="required"
              value={memberInfo.aiVersion}
              disabled={(!isCurrentUser || memberInfo.ready) && !isHost}
              onChange={(e) => {
                this.changeValue(e, memberInfo.userId);
              }}
            >
              {
                aiList.map((ai, index) => (ai
                  && (
                  <option
                    value={ai._id}
                    key={ai._id || index}
                  >
                    {ai.releaseName}
                  </option>
                  )
                ))
              }
            </select>
          </div>
        );
      }

      return (
        <Link to="/courses" style={{ marginLeft: '5px' }}>Build your bot</Link>
      );
    };
    const selectGameOption = () => {
      const isAiPlayer = Roles.userIsInRole(memberInfo.userId, ROLES.AI);
      const disableAI = !memberInfo.aiList || memberInfo.aiList.length <= 0;
      const disableProps = disableAI ? {
        disabled: true,
        'data-tip': 'You have no robot release, please go to My Robot first if you want play with Robot'
      } : {};
      if (isAiPlayer && isCurrentUser) {
        return (
          <div className={`form-group ${!isHost && 'group-guest'}`}>
            <div className="radio-group">
              <input
                onChange={e => this.handleChangeValue(e)}
                value={GAME_CONFIG_OPTION.HUMAN}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN}
                name="optionGame"
                type="radio"
                id="humanOption"
                disabled={memberInfo.ready && !isHost}
              />
              <label htmlFor="humanOption">Manual</label>
&nbsp;
              <input
                onChange={e => this.handleChangeValue(e)}
                value={GAME_CONFIG_OPTION.AI}
                {...disableProps}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.AI}
                name="optionGame"
                type="radio"
                id="robotOption"
                disabled={memberInfo.ready && !isHost}
              />
              <label htmlFor="robotOption">Robot</label>
            </div>
          </div>
        );
      } return null;
    };
    let opponent = null;

    if (memberInfo.userId !== Meteor.userId()) {
      opponent = users.find(element => element._id === memberInfo.userId);
    }

    return (
      <div
        className="player--option select--option"
        key={memberInfo.userId}
      >
        <span className={`player--info__${memberInfo.userId === gameData.owner ? 'hosted' : 'guest'}`}>
          <div className="player--info__avatarName">
            {
              memberInfo.userId === Meteor.userId()
                ? (
                  <img
                    src={Meteor.user().avatar ? Meteor.user().avatar.url : "/img_v2/ProfileIcon.png"}
                    alt="user Chat"
                  />
                )
                : (
                  <img
                    src={opponent && opponent.avatar ? opponent.avatar.url : "/img_v2/ProfileIcon.png"}
                    alt="user Chat"
                  />
                )
            }
            <span>
              {name}
              {' '}
              {memberInfo.userId === gameData.owner && '(Host)'}
            </span>
          </div>
          <div className="player--info__wrapper">
            {
              this.state[memberInfo.teamID] !== null && this.state[memberInfo.teamID] !== undefined
              && (
              <div className="player--selection__coin">
                <img src="/images/coin.png" alt="" />
                <span>{this.state[memberInfo.teamID]}</span>
              </div>
              )
            }
          </div>
        </span>
        <div className={`player--info ${!selectGameOption() && 'no-option'} ${hostIsAI && isHost && 'host'}`}>
          {
            selectGameOption()
          }
          <div className="player--info__selectAI">
            {
              isCurrentUser
                ? selectAIVersion()
                : (
                  <span className="player--info__name">
                    {aiVersion ? `Playing with robot ${aiVersion.releaseName}` : 'No robot released yet'}
                  </span>
                )
            }
          </div>

        </div>
        <div className="player--timeout">
          <div className="player--info__container">
            {
              memberInfo.ready && memberInfo.userId !== gameData.owner
              && <span className="player--info__ready">READY</span>
            }
          </div>
        </div>
      </div>
    );
  }

  renderTeamInfo = (memberInfo) => {
    const { gameData } = this.props;

    if (!memberInfo) return null;
    return (
      <div key={memberInfo.userId}>
        {
          memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN
          && this.renderManualTeamMember(memberInfo)
        }
        {
          memberInfo.playerType === GAME_CONFIG_OPTION.AI
          && this.renderAITeamMember(memberInfo)
        }
        {
          !!(Array.isArray(memberInfo.defaultItems) && memberInfo.defaultItems.length)
          && (
          <ItemEquipped
            renderTypes={MAIN_ITEMS[gameData.gameId]}
            ownerRoom={gameData.owner}
            gameRoomId={gameData._id}
            userId={memberInfo.userId}
            defaultItems={memberInfo.defaultItems}
          />
          )
        }
      </div>
    );
  };

  render() {
    const {
      gameData, loading, checkUserStatus, countdown, users
    } = this.props;
    const {
      isModalOpen, modalMessage, isMinimized, noRobot, readyButton, notReady
    } = this.state;

    if (loading) {
      return (
        <div className="container page--gamesroom">
          {/* <Banner title="Configure Game" backFunction={this.backFunction} /> */}
        </div>
      );
    }
    if (gameData) {
      const team1 = gameData.playerInfo[0];
      const team2 = gameData.playerInfo[1];
      const buttonName = checkUserStatus ? BUTTON.WAITING : BUTTON.START_GAME;
      let countdownFormat = '';

      if (countdown && countdown.count) {
        countdownFormat = moment()
          .startOf('day')
          .seconds(countdown.count)
          .format('mm : ss');
      }
      let playerIsTyping = null;

      if (gameData.playerIsTyping) {
        playerIsTyping = gameData.playerIsTyping.filter(userId => userId !== Meteor.userId());
      }


      return (
        <div className="container page--gamesroom gameroom-wrapper">
          <div className={`page--gamesroom__configure ${isMinimized && 'minimize-chatBox'}`}>
            {
              isModalOpen === true
                ? (
                  <WinnerModal
                    isOpen={isModalOpen}
                    handleModal={this.handleModal}
                    message={modalMessage}
                  />
                )
                : null
            }
            {/* <Banner title="Configure Game" backFunction={this.backFunction} /> */}
            <div className="option--wrapper tg-container">
              <div className="option__header">
                <h1 className="option__header__title">CONFIGURE PLAYER MODES</h1>
              </div>
              <div className="option__content">
                <div className="player--selection">
                  {/* <div className="player--selection__title"> */}
                  {/* Team 1 */}
                  {/* </div> */}
                  <div className="">
                    {this.renderTeamInfo(team1)}
                  </div>
                </div>
                <div className="option__content__center">
                  <span>VS</span>
                </div>
                <div className="player--selection">
                  {/* <div className="player--selection__title"> */}
                  {/* Team 2 */}
                  {/* </div> */}
                  <div className="">
                    {this.renderTeamInfo(team2)}
                  </div>
                </div>
              </div>
            </div>
            <div className="option--wrapper tg-container">
              {
                !!(Array.isArray(team1.userId && team1.defaultItems) && team1.defaultItems.length)
                && (
                <ItemEquipped
                  renderTypes={BACKGROUND_ITEMS[gameData.gameId]}
                  ownerRoom={gameData.owner}
                  gameRoomId={gameData._id}
                  userId={team1.userId}
                  defaultItems={team1.defaultItems}
                />
                )
              }
              {
                <div className="button--block">
                  <button
                    className={`button--startgame ${noRobot && 'disabled-button'}`}
                    onClick={() => this.handleReadyButton()}
                    disabled={noRobot}
                  >
                    {readyButton}
                  </button>
                  <button
                    className={`button--startgame leave ${!notReady && 'disabled-button'}`}
                    onClick={() => this.backFunction()}
                    disabled={buttonName === BUTTON.START_GAME && (noRobot || notReady)}
                  >
                    Leave
                  </button>
                </div>
              }
              <div className="button--startTournamentGame">
                {checkUserStatus
                  ? `${buttonName} for your opponent ${countdownFormat}`
                  : `${buttonName} in ${countdown ? countdown.countdownStartGame : 0}`}
              </div>
              <div className="warningtext">
                Warning: you will lose the game if you switch off or close the browser tab after game starts!
              </div>
            </div>
          </div>
          <div className={`page--gamesroom__log ${isMinimized && 'minimize-chatBox'}`}>
            <div className="chatHistoryBlock">
              <div className="chatHistoryHeader" onClick={() => this.handleMinimizeChatBox()}>
                <div className="chatHistoryTitle">
                  Chat
                </div>
                <div aria-hidden="true" className="chatHistoryHeaderButton">
                  {
                    isMinimized ? '+' : '-'
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

                        if (item[0].sender !== Meteor.userId() && item[0].sender !== CHAT_SENDER.SYSTEM) {
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
    return null;
  }
}
