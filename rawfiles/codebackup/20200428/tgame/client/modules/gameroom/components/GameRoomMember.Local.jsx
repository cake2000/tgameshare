/* global Roles */
/* eslint no-underscore-dangle: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _find from 'lodash/find';
import { Link } from 'react-router-dom';
import { GAME_CONFIG_OPTION, ROLES, MAIN_ITEMS } from '../../../../lib/enum';
import ItemEquipped from '../containers/ItemEquipped';

class LocalGameRoomMember extends React.Component {
  static propTypes = {
    gameRoomData: PropTypes.objectOf(PropTypes.any),
    memberInfo: PropTypes.objectOf(PropTypes.any).isRequired,
    index: PropTypes.number.isRequired,
    defaultItems: PropTypes.arrayOf(PropTypes.any),
    playerController: PropTypes.objectOf(PropTypes.any).isRequired,
    handleSelectOptionType: PropTypes.func.isRequired,
    handleSelectReleaseVersion: PropTypes.func.isRequired
  };

  static defaultProps = {
    gameRoomData: {},
    defaultItems: []
  };

  renderOptionMySelf(player) {
    const { playerController, handleSelectOptionType } = this.props;
    return (
      <div
        className={["team-session__groups__content__option", playerController.type === GAME_CONFIG_OPTION.HUMAN ? 'team-session__groups__content__option--active' : ''].join(' ')}
        aria-hidden
        onClick={() => { handleSelectOptionType(player, GAME_CONFIG_OPTION.HUMAN, false); }}
      >
        <input
          type="radio"
          name={player}
          id={`${player}-radio-myself`}
          value="myself"
          className="session__groups__content__option__radio"
          checked={playerController.type === GAME_CONFIG_OPTION.HUMAN}
          readOnly
        />
        <label htmlFor={`${player}-radio-myself`}>Manual Control</label>
      </div>
    );
  }

  onChangeRobotVersion = (e) => {
    const { memberInfo, handleSelectReleaseVersion, gamesRelease } = this.props;
    const slot = _get(memberInfo, 'slot');
    const botId = e.target.value;
    const label = _get(_find(gamesRelease, { _id: botId }), 'releaseName');

    handleSelectReleaseVersion(slot, botId, label);
  }

  renderOptionMyRobot(player) {
    const {
      gamesRelease, playerController, handleSelectOptionType
    } = this.props;
    const haveRobot = !!(gamesRelease && gamesRelease.length > 0);
    const isAIAccount = Roles.userIsInRole(Meteor.userId(), ROLES.AI);

    return (
      <div>
        {
          isAIAccount
          && (
          <div
            className={["team-session__groups__content__option", playerController.type === GAME_CONFIG_OPTION.AI && !playerController.selectTBot ? 'team-session__groups__content__option--active' : ''].join(' ')}
            aria-hidden
            onClick={() => { handleSelectOptionType(player, GAME_CONFIG_OPTION.AI, false); }}
          >
            <input
              type="radio"
              name={player}
              value="myAI"
              id={`${player}-radio`}
              checked={playerController.type === GAME_CONFIG_OPTION.AI && !playerController.selectTBot}
              className="player--option__ratio"
              readOnly
              disabled={!haveRobot}
            />
            <label htmlFor={`${player}-radio`}>Your Bot</label>
            {
              playerController.type === GAME_CONFIG_OPTION.AI && !playerController.selectTBot && haveRobot
              && (
              <div className="team-session__groups__content__option__select">
                <div className="selectCustomize--Robot">
                  <select
                    className="selectVienpn"
                    onChange={this.onChangeRobotVersion}
                    value={playerController.version}
                  >
                    {
                      _.map(gamesRelease, item => (
                        <option className="selection__option" value={item._id} key={item._id}>{item.releaseName}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              )
            }
            {!haveRobot && <Link to="/courses" style={{ marginLeft: '5px' }}>Build your bot</Link>}
          </div>
          )
        }
        <div
          className={["team-session__groups__content__option", playerController.selectTBot ? 'team-session__groups__content__option--active' : ''].join(' ')}
          aria-hidden
          onClick={() => { handleSelectOptionType(player, GAME_CONFIG_OPTION.AI, true); }}
        >
          <input
            type="radio"
            name={player}
            id={`${player}-radio-system`}
            value="systemAI"
            checked={playerController.selectTBot}
            className="player--option__ratio"
            readOnly
          />
          <label htmlFor={`${player}-radio-system`}>TGame Bot</label>
        </div>
      </div>
    );
  }

  renderOptionNone(player) {
    const { playerController, handleSelectOptionType } = this.props;
    return (
      <div
        className={["team-session__groups__content__option", playerController.type === GAME_CONFIG_OPTION.NONE ? 'team-session__groups__content__option--active' : ''].join(' ')}
        aria-hidden
        onClick={() => { handleSelectOptionType(player, GAME_CONFIG_OPTION.NONE, false); }}
      >
        <input
          type="radio"
          name={player}
          id={`${player}-radio-none`}
          value="none"
          className="player--option__ratio"
          checked={playerController.type === GAME_CONFIG_OPTION.NONE}
          readOnly
        />
        <label htmlFor={`${player}-radio-none`}>None</label>
      </div>
    );
  }

  render() {
    const {
      gameRoomData, defaultItems, increaseHeight, memberInfo, index, playerController
    } = this.props;
    const userId = Meteor.userId();

    return (
      <div className={`team-session__groups ${increaseHeight ? 'player-increaseHeight' : ''}`}>
        <div className="team-session__groups__title">
          {`Player ${memberInfo.slot}`}
        </div>
        <div className="team-session__groups__content">
          {this.renderOptionMySelf(memberInfo.slot)}
          {this.renderOptionMyRobot(memberInfo.slot)}
          {index !== 0 && this.renderOptionNone(memberInfo.slot)}
          {
            !!(Array.isArray(defaultItems) && defaultItems.length > 0) && playerController.type === GAME_CONFIG_OPTION.HUMAN
            && (
              <ItemEquipped
                renderTypes={MAIN_ITEMS[gameRoomData.gameId]}
                gameRoomId={gameRoomData._id}
                userId={userId}
                defaultItems={defaultItems}
              />
            )
          }
        </div>
      </div>
    );
  }
}

export default LocalGameRoomMember;
