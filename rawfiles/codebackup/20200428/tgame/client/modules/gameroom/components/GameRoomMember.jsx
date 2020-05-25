/* eslint no-underscore-dangle: 0 */
/* globals Roles */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import {
  GAME_CONFIG_OPTION, ROLES, SLOT_OPTION, MAIN_ITEMS
} from '../../../../lib/enum';
import ItemEquipped from '../containers/ItemEquipped';

class GameRoomMember extends React.Component {
  static propTypes = {
    gameData: PropTypes.objectOf(PropTypes.any),
    memberInfo: PropTypes.objectOf(PropTypes.any).isRequired,
    isGamePool: PropTypes.bool,
    index: PropTypes.number.isRequired,
    handleInvitationModel: PropTypes.func.isRequired,
    changePlayerType: PropTypes.func.isRequired,
    users: PropTypes.arrayOf(PropTypes.any),
    handleCancelInvite: PropTypes.func.isRequired,
    handleSelectOption: PropTypes.func.isRequired,
    userView: PropTypes.objectOf(PropTypes.any),
    handleChangeSlotOption: PropTypes.func.isRequired
  };

  static defaultProps = {
    gameData: {},
    isGamePool: false,
    users: [],
    userView: null
  };

  constructor(props) {
    super(props);

    this.state = {
      timer: 0
    };

    this.interval = null;
  }

  handleInvitationModel = (e, teamID) => {
    e.preventDefault();
    const { handleInvitationModel, memberInfo: { slot } } = this.props;
    handleInvitationModel(true, teamID, slot);
  }

  handleChangeValue = (value, slot) => {
    const { gameData, changePlayerType } = this.props;
    changePlayerType(gameData._id, value, slot);
  };

  changeValue = (e, userId) => {
    const { handleSelectOption, gameData } = this.props;
    const { value } = e.target;

    handleSelectOption(gameData._id, userId, value);
  };

  timer = () => {
    const { timer } = this.state;
    this.setState({ timer: timer + 1 });
  }

  clearInterval = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  componentDidMount() {
    const { memberInfo, gameData } = this.props;
    const isHost = Meteor.userId() === gameData.owner;

    // set interval when user is invite or not ready when user reload page.
    if (isHost && !memberInfo.ready && memberInfo.playerType !== "default") {
      this.clearInterval();
      this.setState({ timer: 0 });
      this.interval = setInterval(this.timer, 1000);
    }
  }

  componentDidUpdate(prevProps) {
    const { memberInfo, gameData } = this.props;
    const { memberInfo: prevMemberInfo } = prevProps;
    const isHost = Meteor.userId() === gameData.owner;
    // just set interval and clear interval for the host
    // set interval when
    // - when user is invite and not accept yet
    // - when user in room and not ready
    // - when user change ready to not ready
    // clear interval when
    // - when user change not ready to ready
    // - when user leave room
    if (isHost && ((prevMemberInfo.playerType === "default" && memberInfo.playerType !== "default")
    || (prevProps.memberInfo.inRoom != memberInfo.inRoom) // eslint-disable-line
    || (prevProps.memberInfo.ready && !memberInfo.ready))) {
      this.clearInterval();
      this.setState({ timer: 0 }); // eslint-disable-line
      this.interval = setInterval(this.timer, 1000);
    }

    if (isHost && ((prevMemberInfo.playerType !== "default" && memberInfo.playerType === "default")
    || (!prevMemberInfo.ready && memberInfo.ready))) {
      this.clearInterval();
    }
  }

  renderManualTeamMember(memberInfo) {
    const { gameData, users, handleCancelInvite } = this.props;
    const { timer } = this.state;
    let coins = null;
    const user = Meteor.users.findOne({ _id: memberInfo.userId });
    coins = get(user, 'profile.coins', null);
    const isHost = Meteor.userId() === gameData.owner;
    const disableAI = !memberInfo.aiList || memberInfo.aiList.length <= 0;
    const hostIsAI = disableAI && memberInfo.userId === Meteor.userId() && isHost;
    const currentUserId = Meteor.userId();
    const isCurrentUser = memberInfo.userId === currentUserId;
    const disableProps = disableAI ? {
      disabled: true,
      'data-tip': 'You have no robot release, please go to the Robot page first if you want play with Robot'
    } : {};
    const allowCancel = memberInfo.slotOption !== SLOT_OPTION.ROBOT && memberInfo.invitedBy === Meteor.userId();

    const selectGameOption = () => {
      const isAiPlayer = Roles.userIsInRole(memberInfo.userId, ROLES.AI);
      if (isAiPlayer && memberInfo.userId === Meteor.userId()) {
        return (
          <div className={`form-group--host form-group ${!isHost && 'group-guest'}`}>
            <div className={`radio-group ${memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN ? 'radio-group--active' : ''}`} onClick={() => this.handleChangeValue(GAME_CONFIG_OPTION.HUMAN, memberInfo.slot)} role="presentation">
              <input
                readOnly
                value={GAME_CONFIG_OPTION.HUMAN}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN}
                name="optionGame"
                type="radio"
                id="humanOption"
                disabled={memberInfo.ready && !isHost}
              />
              <label htmlFor="humanOption">Manual</label> {/* eslint-disable-line */}
              &nbsp;
            </div>
            <div className={`radio-group ${memberInfo.playerType === GAME_CONFIG_OPTION.AI ? 'radio-group--active' : ''}`} onClick={() => this.handleChangeValue(GAME_CONFIG_OPTION.AI, memberInfo.slot)} role="presentation">
              <input
                readOnly
                value={GAME_CONFIG_OPTION.AI}
                {...disableProps}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.AI}
                name="optionGame"
                type="radio"
                id="robotOption"
                disabled={memberInfo.ready && !isHost}
              />
              <label {...disableProps} htmlFor="robotOption">Robot</label> {/* eslint-disable-line */}
            </div>
          </div>
        );
      } return null;
    };
    let opponent = null;

    if (memberInfo.userId !== Meteor.userId()) {
      opponent = users.find(element => element._id === memberInfo.userId);
      coins = get(opponent, 'profile.coins', null);
    }

    return (
      <div
        className="player--option select--option"
        key={memberInfo.userId}
      >
        <span className="player--info__hosted">
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
            <span>{memberInfo.username} {memberInfo.userId === gameData.owner && '(Host)'}</span> {/* eslint-disable-line */}
          </div>
          <div className="player--info__wrapper">
            {
              coins
              && (
                <div className="player--selection__coin">
                  <img src="/images/coin.png" alt="" />
                  <span>{coins}</span>
                </div>
              )
            }
          </div>
        </span>
        <div className={`player--info ${!selectGameOption() && 'no-option'} ${hostIsAI && isHost && 'host'}`}>
          {selectGameOption()}
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
          <div className={["player--info__container", memberInfo.ready && memberInfo.userId === Meteor.userId() ? 'player--info__container__ready' : ''].join(' ')}>
            {
              memberInfo.ready && memberInfo.userId !== gameData.owner
              && <span className="player--info__ready">READY</span>
            }
            {
              isHost && (!memberInfo.inRoom && !memberInfo.ready) && memberInfo.userId !== Meteor.userId()
              && (
                `No Response (${timer}s)`
              )
            }
            {
              isHost && memberInfo.inRoom && !memberInfo.ready && memberInfo.userId !== Meteor.userId()
              && (
                `Getting Ready (${timer}s)`
              )
            }
          </div>
          {
            allowCancel
            && (
              <button
                type="button"
                className="btn"
                style={{ width: '80px' }}
                onClick={() => handleCancelInvite(memberInfo.userId)}
              >
                {memberInfo.inRoom ? 'Remove' : 'Cancel'}
              </button>
            )
          }
        </div>
      </div>
    );
  }

  renderAITeamMember(memberInfo) {
    const { gameData, users, handleCancelInvite } = this.props;
    const { timer } = this.state;
    const currentUserId = Meteor.userId();
    let coins = null;
    const user = Meteor.users.findOne({ _id: memberInfo.userId });
    coins = get(user, 'profile.coins', null);

    const isCurrentUser = memberInfo.userId === currentUserId;
    const isHost = currentUserId === gameData.owner;
    const { aiList } = memberInfo;
    const hostIsAI = memberInfo.userId === Meteor.userId() && isHost;
    const aiVersion = _.find(memberInfo.aiList, ai => ai._id === memberInfo.aiVersion);
    const allowCancel = memberInfo.slotOption !== SLOT_OPTION.ROBOT && memberInfo.invitedBy === Meteor.userId();
    if (!isHost) {
      debugger;
    }

    const selectAIVersion = () => {
      return (aiList && aiList.length > 0) && (
      <div className="form-group">
        <select // eslint-disable-line
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
                  key={index} // eslint-disable-line
                >
                  {ai.releaseName}
                </option>
              )
            ))
          }
        </select>
      </div>
      );
    };
    const selectGameOption = () => {
      const isAiPlayer = Roles.userIsInRole(memberInfo.userId, ROLES.AI);
      const disableAI = !memberInfo.aiList || memberInfo.aiList.length <= 0;
      const disableProps = disableAI ? {
        disabled: true,
        'data-tip': 'You have no robot release, please go to the Robot page first if you want play with Robot'
      } : {};
      if (isAiPlayer && isCurrentUser) {
        return (
          <div className={`form-group--guest  form-group ${!isHost && 'group-guest'}`}>
            <div
              className={`radio-group ${memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN ? 'radio-group--active' : ''}`}
              onClick={() => {
                if (memberInfo.ready && !isHost) return;
                this.handleChangeValue(GAME_CONFIG_OPTION.HUMAN, memberInfo.slot);
              }}
              role="presentation"
            >
              <input
                readOnly
                value={GAME_CONFIG_OPTION.HUMAN}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN}
                name="optionGame"
                type="radio"
                id="humanOption"
                disabled={memberInfo.ready && !isHost}
              />
              <label htmlFor="humanOption">Manual</label> {/* eslint-disable-line */}
              &nbsp;
            </div>
            <div
              className={`radio-group ${memberInfo.playerType === GAME_CONFIG_OPTION.AI ? 'radio-group--active' : ''}`}
              onClick={() => {
                if (memberInfo.ready && !isHost) return;
                this.handleChangeValue(GAME_CONFIG_OPTION.HUMAN, memberInfo.slot);
              }}
              role="presentation"
            >
              <input
                readOnly
                value={GAME_CONFIG_OPTION.AI}
                {...disableProps}
                checked={memberInfo.playerType === GAME_CONFIG_OPTION.AI}
                name="optionGame"
                type="radio"
                id="robotOption"
                disabled={memberInfo.ready && !isHost}
              />
              <label htmlFor="robotOption">Your Bot</label> {/* eslint-disable-line */}
              { disableAI && <Link to="/courses" style={{ marginLeft: '5px' }}>Build your bot</Link> }
            </div>
          </div>
        );
      } return null;
    };
    let opponent = null;

    if (memberInfo.userId !== Meteor.userId()) {
      opponent = users.find(element => element._id === memberInfo.userId);
      coins = get(opponent, 'profile.coins', null);
    }

    return (
      <div
        className="player--option select--option"
        key={memberInfo.userId}
      >
        <span className="player--info__hosted">
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
            <span>{memberInfo.username} {memberInfo.userId === gameData.owner && '(Host)'}</span> {/* eslint-disable-line */}
          </div>
          <div className="player--info__wrapper">
            {
              coins
              && (
                <div className="player--selection__coin">
                  <img src="/images/coin.png" alt="" />
                  <span>{coins}</span>
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
          <div className={["player--info__container", memberInfo.ready && memberInfo.userId === Meteor.userId() ? 'player--info__container__ready' : ''].join(' ')}>
            {
              memberInfo.ready && memberInfo.userId !== gameData.owner
              && <span className="player--info__ready">READY</span>
            }
            {
              isHost && (!memberInfo.inRoom && !memberInfo.ready) && memberInfo.userId !== Meteor.userId()
              && (
                `No Response (${timer}s)`
              )
            }
            {
              isHost && memberInfo.inRoom && !memberInfo.ready && memberInfo.userId !== Meteor.userId()
              && (
                `Getting Ready (${timer}s)`
              )
            }
          </div>
          {
            allowCancel
            && (
              <button
                type="button"
                className="btn"
                style={{ width: '80px' }}
                onClick={() => handleCancelInvite(memberInfo.userId)}
              >
                {memberInfo.inRoom ? 'Remove' : 'Cancel'}
              </button>
            )
          }
        </div>
      </div>
    );
  }

  handleChangeSlotOption = (value, memberInfo) => {
    const { teamID, slot } = memberInfo;
    const { handleChangeSlotOption, gameData } = this.props;
    handleChangeSlotOption(gameData._id, teamID, slot, value);
  }

  renderInviteTeamMember(memberInfo) {
    const { gameData, userView } = this.props;
    const userId = Meteor.userId();
    const isHost = userId === gameData.owner;
    const isSelf = memberInfo.userId === userId;
    const allowInvite = !isSelf
      && ((get(userView, 'teamID') === memberInfo.teamID) || (userView.slot == 0 && memberInfo.slot == 1)) // eslint-disable-line
      && (userView.slot == 0 || userView.slot == 1); // eslint-disable-line

    const aiList = get(memberInfo, 'aiList', []);
    const aiVersion = get(memberInfo, 'aiVersion', '');
    const isTeam2Leader = memberInfo.teamID == 1 && memberInfo.slot == 1; // eslint-disable-line
    const disableOption = memberInfo.userId && memberInfo.ready && !isHost;

    if (memberInfo.slot >= 2) {

      return !isSelf && (
        <div className="player--option select--option" key={memberInfo.teamID}>
          <div className="player--info">
            <div className="NetworkPlayer">
              <div className="form-group">
                {/* <div
                  className={["radio-group", memberInfo.slotOption === SLOT_OPTION.NETWORK_PLAYER ? 'radio-group--active' : ''].join(' ')}
                  onClick={() => {
                    if (disableOption || !allowInvite || memberInfo.userId) return;
                    this.handleChangeSlotOption(SLOT_OPTION.NETWORK_PLAYER, memberInfo);
                  }}
                  role="presentation"
                >
                  <input
                    readOnly
                    value={SLOT_OPTION.NETWORK_PLAYER}
                    checked={memberInfo.slotOption === SLOT_OPTION.NETWORK_PLAYER}
                    name={`slot-option-${memberInfo.slot}`}
                    type="radio"
                    id={`${SLOT_OPTION.NETWORK_PLAYER}-${memberInfo.slot}`}
                    disabled={disableOption || !allowInvite || memberInfo.userId}
                  />
                  <label htmlFor={`${SLOT_OPTION.NETWORK_PLAYER}-${memberInfo.slot}`}>Network Player</label> 
                </div> */}
                {
                  !isTeam2Leader
                  && (
                  <div className={["radio-group", memberInfo.slotOption === SLOT_OPTION.ROBOT ? 'radio-group--active' : ''].join(' ')}>
                    <div
                      onClick={() => {
                        if (disableOption || !allowInvite || memberInfo.userId) return;
                        this.handleChangeSlotOption(SLOT_OPTION.ROBOT, memberInfo);
                      }}
                      role="presentation"
                    >
                      <input
                        readOnly
                        value={SLOT_OPTION.ROBOT}
                        checked={memberInfo.slotOption === SLOT_OPTION.ROBOT}
                        name={`slot-option-${memberInfo.slot}`}
                        type="radio"
                        id={`${SLOT_OPTION.ROBOT}-${memberInfo.slot}`}
                        disabled={disableOption || !allowInvite || memberInfo.userId}
                      />
                      <label htmlFor={`${SLOT_OPTION.ROBOT}-${memberInfo.slot}`}>Robot</label> {/* eslint-disable-line */}
                    </div>
                  </div>
                  )
                }
              </div>
              <div className="team-session__groups__content__option__select">
                <div className="selectCustomize">
                  {
                    memberInfo.slotOption === SLOT_OPTION.ROBOT && allowInvite
                    && (
                      <select // eslint-disable-line
                        required="required"
                        className="selectVienpn"
                        value={aiVersion}
                        disabled={memberInfo.ready && !isHost}
                        onChange={(e) => {
                          this.changeValue(e, memberInfo.userId);
                        }}
                      >
                        
                        {
                          aiList.map((ai, index) => (ai
                            && (
                              <option
                                value={ai._id}
                                key={index} // eslint-disable-line
                              >
                                {ai.releaseName}
                              </option>
                            )
                          ))
                        }
                      </select>
                    )
                  }
                  {
                    // allowInvite && memberInfo.slotOption === SLOT_OPTION.NETWORK_PLAYER && !memberInfo.userId
                    // && (
                    //   <button
                    //     type="button"
                    //     className="btn"
                    //     onClick={e => this.handleInvitationModel(e, memberInfo.teamID)}
                    //   >
                    //     Invite
                    //   </button>
                    // )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    }

    return !isSelf && (
      <div className="player--option select--option" key={memberInfo.teamID}>
        <div className="player--info">
          <div className="NetworkPlayer">
            <div className="form-group">
              <div
                className={["radio-group", memberInfo.slotOption === SLOT_OPTION.NETWORK_PLAYER ? 'radio-group--active' : ''].join(' ')}
                onClick={() => {
                  if (disableOption || !allowInvite || memberInfo.userId) return;
                  this.handleChangeSlotOption(SLOT_OPTION.NETWORK_PLAYER, memberInfo);
                }}
                role="presentation"
              >
                <input
                  readOnly
                  value={SLOT_OPTION.NETWORK_PLAYER}
                  checked={memberInfo.slotOption === SLOT_OPTION.NETWORK_PLAYER}
                  name={`slot-option-${memberInfo.slot}`}
                  type="radio"
                  id={`${SLOT_OPTION.NETWORK_PLAYER}-${memberInfo.slot}`}
                  disabled={disableOption || !allowInvite || memberInfo.userId}
                />
                <label htmlFor={`${SLOT_OPTION.NETWORK_PLAYER}-${memberInfo.slot}`}>Network Player</label> {/* eslint-disable-line */}
              </div>
              {
                !isTeam2Leader
                && (
                <div className={["radio-group", memberInfo.slotOption === SLOT_OPTION.ROBOT ? 'radio-group--active' : ''].join(' ')}>
                  <div
                    onClick={() => {
                      if (disableOption || !allowInvite || memberInfo.userId) return;
                      this.handleChangeSlotOption(SLOT_OPTION.ROBOT, memberInfo);
                    }}
                    role="presentation"
                  >
                    <input
                      readOnly
                      value={SLOT_OPTION.ROBOT}
                      checked={memberInfo.slotOption === SLOT_OPTION.ROBOT}
                      name={`slot-option-${memberInfo.slot}`}
                      type="radio"
                      id={`${SLOT_OPTION.ROBOT}-${memberInfo.slot}`}
                      disabled={disableOption || !allowInvite || memberInfo.userId}
                    />
                    <label htmlFor={`${SLOT_OPTION.ROBOT}-${memberInfo.slot}`}>Robot</label> {/* eslint-disable-line */}
                  </div>
                </div>
                )
              }
            </div>
            <div className="team-session__groups__content__option__select">
              <div className="selectCustomize">
                {
                  memberInfo.slotOption === SLOT_OPTION.ROBOT && allowInvite
                  && (
                    <select // eslint-disable-line
                      required="required"
                      className="selectVienpn"
                      value={aiVersion}
                      disabled={memberInfo.ready && !isHost}
                    >
                      onChange={(e) => {
                        this.changeValue(e, memberInfo.userId);
                      }}
                      {
                        aiList.map((ai, index) => (ai
                          && (
                            <option
                              value={ai._id}
                              key={index} // eslint-disable-line
                            >
                              {ai.releaseName}
                            </option>
                          )
                        ))
                      }
                    </select>
                  )
                }
                {
                  allowInvite && memberInfo.slotOption === SLOT_OPTION.NETWORK_PLAYER && !memberInfo.userId
                  && (
                    <button
                      type="button"
                      className="btn"
                      onClick={e => this.handleInvitationModel(e, memberInfo.teamID)}
                    >
                      Invite
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { memberInfo, gameData, isGamePool } = this.props;
    return (
      <div className="team-session__groups">
        <div className="">
          <div className={`${memberInfo.slotOption} - ${memberInfo.playerType} - ${memberInfo.playerType} `} key={memberInfo.teamID}>
            <div className="team-session__groups__title">
              {`Player ${memberInfo.slot}`}
            </div>
            <div className="team-session__groups__content team-session__groups__content--roomMember">
              {
                memberInfo.playerType === GAME_CONFIG_OPTION.HUMAN
                && this.renderManualTeamMember(memberInfo)
              }
              {
                memberInfo.playerType === GAME_CONFIG_OPTION.AI
                // && memberInfo.slotOption !== SLOT_OPTION.ROBOT
                && this.renderAITeamMember(memberInfo)
              }
              {
                memberInfo.slotOption !== null 
                && this.renderInviteTeamMember(memberInfo)
              }
              {
                !!(Array.isArray(memberInfo.userId && memberInfo.defaultItems) && memberInfo.defaultItems.length) && isGamePool
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
          </div>
        </div>
      </div>
    );
  }
}

export default GameRoomMember;
